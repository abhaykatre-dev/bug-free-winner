from __future__ import annotations

import base64

import numpy as np
from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth
from db.sqlite import get_conn
from ml.xai import image_feature_vector

similarity_bp = Blueprint("similarity", __name__)


class SimilarityRequest(BaseModel):
    imageB64: str | None = None
    detectionId: str | None = None
    imageUrl: str | None = None
    topK: int = Field(default=3, ge=1, le=10)


@similarity_bp.post("/similarity")
@require_auth
def similarity():
    """Real cosine similarity search against SQLite case_vectors."""
    from io import BytesIO
    from PIL import Image

    body = SimilarityRequest.model_validate(request.get_json(force=True))

    pil = None

    # Source: base64 image
    if body.imageB64:
        try:
            pil = Image.open(BytesIO(base64.b64decode(body.imageB64))).convert("RGB")
        except Exception:
            pass

    # Source: URL
    if pil is None and body.imageUrl:
        try:
            import httpx
            r = httpx.get(body.imageUrl, timeout=15.0)
            r.raise_for_status()
            pil = Image.open(BytesIO(r.content)).convert("RGB")
        except Exception:
            pass

    # Source: detectionId — fetch heatmap b64 from diagnoses as proxy
    if pil is None and body.detectionId:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT heatmap_image_b64 FROM diagnoses WHERE diagnosis_id = ?",
            (body.detectionId,),
        )
        row = cur.fetchone()
        conn.close()
        if row and row["heatmap_image_b64"]:
            try:
                pil = Image.open(BytesIO(base64.b64decode(row["heatmap_image_b64"]))).convert("RGB")
            except Exception:
                pass

    if pil is None:
        return jsonify({"similarCases": [], "note": "Could not load image for similarity search."})

    fv = image_feature_vector(pil, bins=64)
    fv_norm = fv / (np.linalg.norm(fv) + 1e-8)

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT case_id, disease, feature_vector_b64, outcome, image_path FROM case_vectors")
    rows = cur.fetchall()
    conn.close()

    sims = []
    for r in rows:
        try:
            vec = np.frombuffer(base64.b64decode(r["feature_vector_b64"]), dtype=np.float32)
            if vec.size != fv_norm.size:
                continue
            sim = float(np.dot(fv_norm, vec / (np.linalg.norm(vec) + 1e-8)))
            sims.append({
                "case_id": r["case_id"],
                "thumbnail_url": r["image_path"] or "",
                "disease": r["disease"],
                "similarity": round(max(0.0, min(1.0, sim)), 3),
                "outcome": r["outcome"] or "",
            })
        except Exception:
            continue

    sims.sort(key=lambda x: x["similarity"], reverse=True)
    return jsonify({"similarCases": sims[:body.topK]})
