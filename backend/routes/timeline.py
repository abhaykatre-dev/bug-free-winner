from __future__ import annotations

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth
from data.timeline import generate_action_timeline

timeline_bp = Blueprint("timeline", __name__)


class TimelineRequest(BaseModel):
    disease: str
    severity: str
    pondSizeM2: float | None = Field(default=None, ge=0)


@timeline_bp.post("/timeline")
@require_auth
def timeline():
    body = TimelineRequest.model_validate(request.get_json(force=True))
    result = generate_action_timeline(
        disease=body.disease,
        severity=body.severity,
        pond_size_m2=body.pondSizeM2,
    )
    return jsonify({"disease": body.disease, "severity": body.severity, "days": result})
