from __future__ import annotations

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth
from data.timeline import generate_action_timeline

timeline_bp = Blueprint("timeline", __name__)


class TimelineRequest(BaseModel):
    disease: str = Field(min_length=2)
    severity: str = Field(min_length=2)
    fishCount: int | None = Field(default=None, ge=0)
    pondSizeM2: float | None = Field(default=None, ge=0)


@timeline_bp.post("/action-timeline")
@require_auth
def action_timeline():
    body = TimelineRequest.model_validate(request.get_json(force=True))
    timeline = generate_action_timeline(
        disease=body.disease,
        severity=body.severity,
        pond_size_m2=body.pondSizeM2,
    )
    return jsonify({"timeline": timeline})

