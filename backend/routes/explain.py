from __future__ import annotations

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth
from ml.gradcam import generate_gradcam_heatmap
from services.settings import Settings


explain_bp = Blueprint("explain", __name__)


class ExplainRequest(BaseModel):
    imageUrl: str | None = Field(default=None, min_length=5)
    imageB64: str | None = None
    diseaseClass: str = Field(min_length=2)


@explain_bp.post("/explain")
@require_auth
def explain():
    """
    FR-02: Grad-CAM heatmap + feature importance for a given image + disease class.
    Accepts either imageB64 (base64) or imageUrl (URL).
    """
    from io import BytesIO
    import base64
    import httpx
    from PIL import Image

    body = ExplainRequest.model_validate(request.get_json(force=True))
    settings = Settings.from_env()

    pil = None
    if body.imageB64:
        try:
            pil = Image.open(BytesIO(base64.b64decode(body.imageB64))).convert("RGB")
        except Exception:
            pass

    if pil is None and body.imageUrl:
        try:
            r = httpx.get(body.imageUrl, timeout=15.0)
            r.raise_for_status()
            pil = Image.open(BytesIO(r.content)).convert("RGB")
        except Exception:
            pass

    if pil is None:
        return jsonify({
            "heatmap_image_b64": None,
            "bounding_box": None,
            "feature_importance": [],
            "note": "Could not load image. Provide imageB64 or a valid imageUrl.",
        })

    mobilenet_path = settings.mobilenet_model_path or "models/mobilenet_fish.pt"
    labels_path = settings.mobilenet_labels_path or "models/mobilenet_labels.json"
    hm = generate_gradcam_heatmap(pil, mobilenet_path, labels_path)

    return jsonify({
        "heatmap_image_b64": hm.heatmap_b64_png,
        "bounding_box": hm.bounding_box,
        "feature_importance": hm.feature_importance,
        "disease_class": body.diseaseClass,
    })
