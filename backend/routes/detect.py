from __future__ import annotations

import uuid

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth
from services.settings import Settings
from ml.runtime import ModelRuntime, ModelNotReadyError
from ml.preprocess import load_image_from_url, preprocess_pil_to_nhwc_float32
from data.disease_info import (
    CLASSES,
    disease_details,
    severity_from_confidence,
    trust_label,
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


@detect_bp.post("/detect")
@require_auth
def detect():
    body = DetectRequest.model_validate(request.get_json(force=True))
    settings = Settings.from_env()
    runtime = ModelRuntime.from_settings(settings)

    try:
        pil = load_image_from_url(body.imageUrl)
        input_tensor = preprocess_pil_to_nhwc_float32(pil, size=224)
        probs = runtime.predict_proba(input_tensor)
    except ModelNotReadyError as e:
        return jsonify({"error": "Model not ready", "detail": str(e)}), 503

    top3 = (
        sorted(
            [{"label": CLASSES[i], "confidence": float(probs[i])} for i in range(len(CLASSES))],
            key=lambda x: x["confidence"],
            reverse=True,
        )[:3]
        if probs is not None
        else []
    )

    top = top3[0]
    disease = top["label"]
    confidence = float(top["confidence"])

    details = disease_details(disease)
    severity = severity_from_confidence(disease, confidence)

    economic = None
    if body.fishCount and body.marketPricePerKg and body.avgWeightKg:
        economic = calculate_economic_loss(
            disease=disease,
            fish_count=body.fishCount,
            market_price_per_kg=body.marketPricePerKg,
            avg_weight_kg=body.avgWeightKg,
        )

    timeline = generate_action_timeline(disease=disease, severity=severity, pond_size_m2=None)

    detection_id = f"det_{uuid.uuid4().hex[:10]}"

    return jsonify(
        {
            "detectionId": detection_id,
            "disease": disease,
            "confidence": confidence,
            "severity": severity,
            "category": details["category"],
            "urgency": details["urgency"],
            "top3": top3,
            "heatmapUrl": None,
            "reasoning": details["reasoning"],
            "causes": details["causes"],
            "treatment": details["treatment"],
            "trustMeter": {"label": trust_label(confidence), "recommendExpert": confidence < 0.70},
            "economicLoss": economic,
            "timeline": timeline,
            "similarCases": [],
            "model": {"type": runtime.model_type, "path": runtime.model_path},
        }
    )

