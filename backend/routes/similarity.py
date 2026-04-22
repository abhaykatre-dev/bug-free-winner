from __future__ import annotations

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth

similarity_bp = Blueprint("similarity", __name__)


class SimilarityRequest(BaseModel):
    detectionId: str | None = None
    imageUrl: str | None = None
    topK: int = Field(default=3, ge=1, le=10)


@similarity_bp.post("/similarity")
@require_auth
def similarity():
    _ = SimilarityRequest.model_validate(request.get_json(force=True))
    return jsonify({"similarCases": []})

