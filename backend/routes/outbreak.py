from __future__ import annotations

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth

outbreak_bp = Blueprint("outbreak", __name__)


class OutbreakRequest(BaseModel):
    pondId: str = Field(min_length=1)
    windowDays: int = Field(default=7, ge=1, le=90)


@outbreak_bp.post("/outbreak-predict")
@require_auth
def outbreak_predict():
    body = OutbreakRequest.model_validate(request.get_json(force=True))
    return jsonify(
        {
            "outbreakProbability": 0.0,
            "riskLevel": "Low",
            "triggerFactors": [],
            "recommendation": "No recent detections available (persistence not configured).",
            "pondId": body.pondId,
            "windowDays": body.windowDays,
        }
    )

