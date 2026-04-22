from __future__ import annotations

import base64
import json
import uuid
from datetime import datetime, timezone

import numpy as np
from flask import Blueprint, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pydantic import BaseModel, Field

from db.sqlite import get_conn, init_db
from ml.xai import generate_saliency_heatmap_and_bbox, image_feature_vector
from services.auth import require_auth
from services.errors import ApiError
from services.translate import translate_text


api_bp = Blueprint("api_prd", __name__)
limiter = Limiter(key_func=get_remote_address, default_limits=["20 per minute"])


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _error(err: ApiError):
    return jsonify(err.to_dict()), err.http_status


def _decode_b64_image(b64: str) -> bytes:
    try:
        return base64.b64decode(b64.encode("ascii"))
    except Exception:
        raise ValueError("invalid_base64")


class DiagnoseRequest(BaseModel):
    image: str = Field(min_length=10, description="base64 image bytes (no data: prefix)")
    pond_id: str | None = None
    fish_count: int | None = Field(default=None, ge=0)
    avg_weight_kg: float | None = Field(default=None, ge=0)
    market_price_per_kg: float | None = Field(default=None, ge=0)
    language: str = Field(default="en", min_length=2, max_length=8)
    lat: float | None = None
    lng: float | None = None


@api_bp.before_app_request
def _ensure_db():
    # Make sure tables exist (idempotent)
    init_db()


@api_bp.post("/diagnose")
@require_auth
def diagnose():
    """
    Implements FishAI_PRD: POST /api/diagnose
    """
    try:
        body = DiagnoseRequest.model_validate(request.get_json(force=True))
    except Exception:
        return _error(
            ApiError(
                code="INVALID_REQUEST",
                message="Invalid request body.",
                suggestion="Ensure required fields match the API spec.",
                http_status=400,
            )
        )

    # Decode and validate image size
    try:
        img_bytes = _decode_b64_image(body.image)
    except ValueError:
        return _error(
            ApiError(
                code="INVALID_IMAGE",
                message="Image must be valid base64 bytes.",
                suggestion="Please upload a JPEG/PNG/WebP file under 10MB.",
                http_status=400,
            )
        )
    if len(img_bytes) > 10 * 1024 * 1024:
        return _error(
            ApiError(
                code="INVALID_IMAGE",
                message="Uploaded image exceeds 10MB limit.",
                suggestion="Compress the image and try again.",
                http_status=400,
            )
        )

    # Load into PIL
    try:
        from PIL import Image
        import io

        pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception:
        return _error(
            ApiError(
                code="INVALID_IMAGE",
                message="Uploaded file is not a valid image.",
                suggestion="Please upload a JPEG, PNG, or WebP file under 10MB.",
                http_status=400,
            )
        )

    # Inference: if you later provide a real model, replace this block.
    # For now, we generate stable top-3 placeholders derived from the feature vector.
    fv = image_feature_vector(pil, bins=64)
    seed = int((fv[:10].sum() * 1e6) % (2**31 - 1))
    rng = np.random.default_rng(seed)

    # Minimal PRD diseases (expand later via knowledge_base.json)
    diseases = [
        "Ich (White Spot Disease)",
        "Bacterial Gill Disease",
        "Saprolegniasis",
        "Fin Rot",
        "Columnaris",
        "Healthy",
    ]
    scores = rng.random(len(diseases))
    scores = scores / (scores.sum() + 1e-9)
    top_idx = np.argsort(scores)[::-1][:3]
    top_preds = [{"disease": diseases[int(i)], "confidence": float(scores[int(i)])} for i in top_idx]
    primary = top_preds[0]["disease"]
    confidence = float(top_preds[0]["confidence"])

    # PRD severity mapping by confidence bands
    if confidence <= 0.33:
        severity = "Mild"
    elif confidence <= 0.66:
        severity = "Moderate"
    else:
        severity = "Critical"

    trust_level = "Low" if confidence < 0.60 else ("Moderate" if confidence < 0.80 else "High")
    trust_message = (
        "Low confidence — please consult a veterinarian"
        if trust_level == "Low"
        else (
            "Moderate confidence — cross-check with the similar cases panel"
            if trust_level == "Moderate"
            else "High confidence — follow treatment plan and monitor"
        )
    )

    # Explainability (heatmap + bbox)
    hm = generate_saliency_heatmap_and_bbox(pil)

    # Minimal knowledge-base-like payloads (will be replaced by knowledge_base.json)
    causes = {
        "environmental": ["Poor aeration", "High stocking density"],
        "biological": ["Likely pathogen consistent with visual cues"],
    }
    treatment = {
        "medicines": [
            {
                "name": "Salt Bath (NaCl)",
                "brand": "Table Salt",
                "dosage": "3–5 g/L for 10 minutes",
                "cost_band": "Very Low (<₹50)",
            }
        ],
        "preventive_steps": ["Quarantine new fish for 14 days", "Maintain stable water quality"],
        "disclaimer": "Consult a registered aquaculture veterinarian before administering medication.",
    }

    progression = [
        {"day": 0, "stage": "Early", "symptoms": "Mild visible symptoms", "mortality_pct": 5},
        {"day": 3, "stage": "Developing", "symptoms": "Symptoms spreading", "mortality_pct": 15},
        {"day": 7, "stage": "Advanced", "symptoms": "Severe symptoms", "mortality_pct": 40},
        {"day": 14, "stage": "Critical", "symptoms": "High mortality without intervention", "mortality_pct": 90},
    ]

    # Similar cases: search in SQLite case_vectors using cosine similarity
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT case_id, disease, feature_vector_b64, outcome, image_path FROM case_vectors")
    rows = cur.fetchall()
    sims = []
    if rows:
        fv_norm = fv / (np.linalg.norm(fv) + 1e-8)
        for r in rows:
            vec = np.frombuffer(base64.b64decode(r["feature_vector_b64"]), dtype=np.float32)
            if vec.size != fv_norm.size:
                continue
            sim = float(np.dot(fv_norm, vec) / ((np.linalg.norm(vec) + 1e-8)))
            sims.append(
                {
                    "case_id": r["case_id"],
                    "thumbnail_url": r["image_path"] or "",
                    "disease": r["disease"],
                    "similarity": max(0.0, min(1.0, sim)),
                    "outcome": r["outcome"] or "",
                }
            )
        sims.sort(key=lambda x: x["similarity"], reverse=True)
        sims = sims[:3]

    # Economic loss (PRD-style)
    economic_loss = None
    if body.fish_count and body.avg_weight_kg and body.market_price_per_kg:
        value_per_fish = body.avg_weight_kg * body.market_price_per_kg
        # crude stage mortality rates keyed by severity
        rate_day3 = 0.15 if severity == "Mild" else (0.30 if severity == "Moderate" else 0.60)
        rate_day7 = 0.40 if severity == "Mild" else (0.55 if severity == "Moderate" else 0.80)
        rate_day14 = 0.70 if severity == "Mild" else (0.90 if severity == "Moderate" else 0.95)
        estimated_deaths_day3 = int(round(body.fish_count * rate_day3))
        estimated_deaths_day7 = int(round(body.fish_count * rate_day7))
        estimated_deaths_day14 = int(round(body.fish_count * rate_day14))
        revenue_loss_day14 = int(round(estimated_deaths_day14 * value_per_fish))
        treatment_cost = int(round(body.fish_count * 0.24))  # ~₹240 per 1000 fish
        net_saving = max(0, revenue_loss_day14 - treatment_cost)
        economic_loss = {
            "fish_at_risk": body.fish_count,
            "estimated_deaths_day3": estimated_deaths_day3,
            "estimated_deaths_day7": estimated_deaths_day7,
            "estimated_deaths_day14": estimated_deaths_day14,
            "revenue_loss_day14_inr": revenue_loss_day14,
            "treatment_cost_inr": treatment_cost,
            "net_saving_inr": net_saving,
        }

    action_timeline = [
        {
            "day": 1,
            "morning": "Increase aeration. Prepare treatment bath per guidance.",
            "evening": "Partial water change (20–30%). Record symptoms.",
            "observation": "Expect limited improvement on first day.",
        },
        {
            "day": 2,
            "morning": "Apply recommended medicine dosage.",
            "evening": "Re-check water parameters; remove dead fish.",
            "observation": "If symptoms worsen, consult a vet.",
        },
    ]

    translated = False
    reasoning = "Detected due to visual patterns consistent with the predicted disease class."
    if body.language and body.language != "en":
        reasoning = translate_text(reasoning, body.language)
        translated = True

    diagnosis_id = f"dx_{datetime.now(timezone.utc).strftime('%Y%m%d')}_{uuid.uuid4().hex[:6]}"

    payload = {
        "diagnosis_id": diagnosis_id,
        "timestamp": _now_iso(),
        "top_predictions": [
            {
                "disease": p["disease"],
                "confidence": p["confidence"],
                "severity": severity if i == 0 else None,
            }
            for i, p in enumerate(top_preds)
        ],
        "primary_disease": primary,
        "confidence": confidence,
        "severity": severity,
        "trust_level": trust_level,
        "trust_message": trust_message,
        "heatmap_image_b64": hm.heatmap_b64_png,
        "bounding_box": hm.bounding_box,
        "reasoning": reasoning,
        "causes": causes,
        "treatment": treatment,
        "progression": progression,
        "similar_cases": sims,
        "economic_loss": economic_loss,
        "action_timeline": action_timeline,
        "translated": translated,
    }

    # Persist
    cur.execute(
        """
        INSERT INTO diagnoses (
            diagnosis_id, timestamp, pond_id, user_id,
            primary_disease, confidence, severity,
            top_predictions_json, heatmap_image_b64, bbox_json,
            reasoning, causes_json, treatment_json, progression_json,
            similar_cases_json, economic_loss_json, action_timeline_json,
            language, lat, lng
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            diagnosis_id,
            payload["timestamp"],
            body.pond_id,
            None,
            primary,
            confidence,
            severity,
            json.dumps(payload["top_predictions"]),
            payload["heatmap_image_b64"],
            json.dumps(payload["bounding_box"]) if payload["bounding_box"] else None,
            payload["reasoning"],
            json.dumps(payload["causes"]),
            json.dumps(payload["treatment"]),
            json.dumps(payload["progression"]),
            json.dumps(payload["similar_cases"]),
            json.dumps(payload["economic_loss"]),
            json.dumps(payload["action_timeline"]),
            body.language,
            body.lat,
            body.lng,
        ),
    )
    conn.commit()
    conn.close()

    return jsonify(payload)


@api_bp.post("/economic-estimate")
@require_auth
def economic_estimate():
    data = request.get_json(force=True) or {}
    disease = data.get("disease")
    severity = data.get("severity")
    fish_count = data.get("fish_count")
    avg_weight_kg = data.get("avg_weight_kg")
    market_price_per_kg = data.get("market_price_per_kg")
    if not all([disease, severity, fish_count, avg_weight_kg, market_price_per_kg]):
        return _error(
            ApiError(
                code="INVALID_REQUEST",
                message="Missing required economic inputs.",
                suggestion="Provide disease, severity, fish_count, avg_weight_kg, market_price_per_kg.",
                http_status=400,
            )
        )

    value_per_fish = float(avg_weight_kg) * float(market_price_per_kg)
    fish_count_i = int(fish_count)
    rate_day14 = 0.70 if severity == "Mild" else (0.90 if severity == "Moderate" else 0.95)
    deaths_day14 = int(round(fish_count_i * rate_day14))
    revenue_loss_day14 = int(round(deaths_day14 * value_per_fish))
    treatment_cost = int(round(fish_count_i * 0.24))
    net_saving = max(0, revenue_loss_day14 - treatment_cost)
    return jsonify(
        {
            "fish_at_risk": fish_count_i,
            "estimated_deaths_day14": deaths_day14,
            "revenue_loss_day14_inr": revenue_loss_day14,
            "treatment_cost_inr": treatment_cost,
            "net_saving_inr": net_saving,
        }
    )


@api_bp.get("/pond-risk/<pond_id>")
@require_auth
def pond_risk(pond_id: str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT primary_disease, timestamp, severity FROM diagnoses WHERE pond_id=?",
        (pond_id,),
    )
    rows = cur.fetchall()
    conn.close()

    diagnosis_count_last_7d = len(rows)
    active_diseases = sorted({r["primary_disease"] for r in rows})[:5]
    # Simple risk score heuristic
    sev_weights = {"Mild": 20, "Moderate": 50, "Critical": 85}
    if not rows:
        risk_score = 0
    else:
        risk_score = int(round(min(100, sum(sev_weights.get(r["severity"], 40) for r in rows) / len(rows))))
    risk_level = "Safe" if risk_score <= 30 else ("Warning" if risk_score <= 70 else "Critical")
    recommended_action = (
        "Monitor and maintain water quality."
        if risk_level == "Safe"
        else ("Treat immediately and test water quality parameters." if risk_level == "Warning" else "Isolate pond and consult expert immediately.")
    )
    return jsonify(
        {
            "pond_id": pond_id,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "active_diseases": active_diseases,
            "diagnosis_count_last_7d": diagnosis_count_last_7d,
            "recommended_action": recommended_action,
        }
    )


def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    from math import asin, cos, radians, sin, sqrt

    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return R * c


@api_bp.get("/outbreak-predict")
@require_auth
def outbreak_predict():
    try:
        lat = float(request.args.get("lat", "nan"))
        lng = float(request.args.get("lng", "nan"))
        radius_km = float(request.args.get("radius_km", "10"))
    except Exception:
        return _error(
            ApiError(
                code="INVALID_REQUEST",
                message="Invalid lat/lng/radius_km.",
                suggestion="Use numeric query params: lat, lng, radius_km.",
                http_status=400,
            )
        )
    if not np.isfinite(lat) or not np.isfinite(lng):
        return _error(
            ApiError(
                code="INVALID_REQUEST",
                message="lat and lng are required.",
                suggestion="Provide lat and lng query params.",
                http_status=400,
            )
        )

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT primary_disease, lat, lng FROM diagnoses WHERE lat IS NOT NULL AND lng IS NOT NULL")
    rows = cur.fetchall()
    conn.close()

    nearby = []
    for r in rows:
        d = _haversine_km(lat, lng, float(r["lat"]), float(r["lng"]))
        if d <= radius_km:
            nearby.append(r["primary_disease"])

    if not nearby:
        return jsonify(
            {
                "zone": "Local Cluster",
                "outbreak_risk_score": 0,
                "outbreak_risk_level": "Low",
                "predicted_disease": None,
                "affected_ponds": 0,
                "forecast_window_days": 7,
                "alert_message": "No recent diagnoses in the selected radius.",
            }
        )

    # If same disease appears 3+ times, raise alert
    from collections import Counter

    c = Counter(nearby)
    disease, count = c.most_common(1)[0]
    risk_score = min(99, int(round((count / 5) * 100)))
    risk_level = "Low" if risk_score < 40 else ("Warning" if risk_score < 70 else "High")
    msg = (
        "Low outbreak risk."
        if risk_level == "Low"
        else (
            f"Elevated outbreak risk detected: {count} nearby diagnoses of {disease}."
            if risk_level == "Warning"
            else f"High outbreak risk detected. {count} nearby diagnoses show {disease}. Take preventive measures immediately."
        )
    )
    return jsonify(
        {
            "zone": "Local Cluster",
            "outbreak_risk_score": risk_score,
            "outbreak_risk_level": risk_level,
            "predicted_disease": disease,
            "affected_ponds": count,
            "forecast_window_days": 7,
            "alert_message": msg,
        }
    )


class TranslateRequest(BaseModel):
    text: str = Field(min_length=1)
    target_language: str = Field(min_length=2, max_length=8)


@api_bp.post("/translate")
@require_auth
def translate():
    body = TranslateRequest.model_validate(request.get_json(force=True))
    translated_text = translate_text(body.text, body.target_language)
    return jsonify(
        {
            "translated_text": translated_text,
            "source_language": "en",
            "target_language": body.target_language,
        }
    )


@api_bp.get("/vets")
@require_auth
def vets():
    # Seed file is optional; if not present, return an empty list.
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    radius_km = float(request.args.get("radius_km", "50"))
    center = None
    if lat is not None and lng is not None:
        try:
            center = (float(lat), float(lng))
        except Exception:
            center = None

    try:
        with open("data/vets_seed.json", "r", encoding="utf-8") as f:
            all_vets = json.load(f).get("vets", [])
    except Exception:
        all_vets = []

    vets_out = []
    for v in all_vets:
        if center:
            d = _haversine_km(center[0], center[1], v["lat"], v["lng"])
            if d > radius_km:
                continue
            v = {**v, "distance_km": round(d, 1)}
        vets_out.append(v)
    return jsonify({"vets": vets_out})

