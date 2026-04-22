from __future__ import annotations

import uuid

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth
from ml.runtime import run_inference
from ml.preprocess import load_image_from_url
from data.disease_info import (
    disease_details,
    severity_from_confidence,
    trust_label,
    trust_message,
)
from data.economic import calculate_economic_loss
from data.timeline import generate_action_timeline

detect_bp = Blueprint("detect", __name__)


class DetectRequest(BaseModel):
    imageUrl: str = Field(min_length=5)
    pondId: str | None = None
    fishCount: int | None = Field(default=None, ge=0)
    marketPricePerKg: float | None = Field(default=None, ge=0)
    avgWeightKg: float | None = Field(default=None, ge=0)
    species: str | None = None


@detect_bp.post("/detect")
@require_auth
def detect():
    """
    PRD-aligned detection via image URL.
    Uses the unified model runtime (MobileNetV2 → ONNX → sklearn → placeholder).
    """
    body = DetectRequest.model_validate(request.get_json(force=True))

    try:
        pil = load_image_from_url(body.imageUrl)
    except Exception as e:
        return jsonify({"error": "Could not load image from URL", "detail": str(e)}), 400

    top3, model_type = run_inference(pil)
    primary = top3[0]["disease"]
    confidence = float(top3[0]["confidence"])

    details = disease_details(primary)
    severity = severity_from_confidence(confidence)
    t_label = trust_label(confidence)
    t_message = trust_message(confidence)

    economic = None
    if body.fishCount and body.fishCount > 0:
        economic = calculate_economic_loss(
            disease=primary,
            fish_count=body.fishCount,
            market_price_per_kg=body.marketPricePerKg,
            avg_weight_kg=body.avgWeightKg or 0.5,
            species=body.species,
        )

    timeline = generate_action_timeline(disease=primary, severity=severity, pond_size_m2=None)
    detection_id = f"det_{uuid.uuid4().hex[:10]}"

    return jsonify({
        "detectionId": detection_id,
        "disease": primary,
        "confidence": round(confidence, 4),
        "severity": severity,
        "category": details.get("category", "Unknown"),
        "urgency": details.get("urgency", "monitor"),
        "top3": top3,
        "heatmapUrl": None,
        "reasoning": details.get("reasoning", ""),
        "causes": details.get("causes", {}),
        "treatment": details.get("treatment", {}),
        "trustMeter": {
            "label": t_label,
            "message": t_message,
            "recommendExpert": confidence < 0.70,
        },
        "economicLoss": economic,
        "timeline": timeline,
        "similarCases": [],
        "model": {"type": model_type},
    })
