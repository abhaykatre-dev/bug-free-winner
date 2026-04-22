from __future__ import annotations

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth

explain_bp = Blueprint("explain", __name__)


class ExplainRequest(BaseModel):
    imageUrl: str = Field(min_length=5)
    diseaseClass: str = Field(min_length=2)


@explain_bp.post("/explain")
@require_auth
def explain():
    # Robust placeholder: the real Grad-CAM needs a TF/Keras graph and a known conv layer.
    # This endpoint exists so the frontend contract is stable even before model export is added.
    _ = ExplainRequest.model_validate(request.get_json(force=True))
    return jsonify(
        {
            "heatmapUrl": None,
            "featureImportance": [],
            "classConfidences": {},
            "note": "Grad-CAM not configured in this repo yet. Provide a TF model export to enable heatmaps.",
        }
    )

