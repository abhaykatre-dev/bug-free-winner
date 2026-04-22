from __future__ import annotations

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth
from data.economic import calculate_economic_loss

economic_bp = Blueprint("economic", __name__)


class EconomicRequest(BaseModel):
    disease: str = Field(min_length=2)
    fishCount: int = Field(ge=0)
    marketPricePerKg: float = Field(ge=0)
    avgWeightKg: float = Field(ge=0)


@economic_bp.post("/economic-loss")
@require_auth
def economic_loss():
    body = EconomicRequest.model_validate(request.get_json(force=True))
    return jsonify(
        calculate_economic_loss(
            disease=body.disease,
            fish_count=body.fishCount,
            market_price_per_kg=body.marketPricePerKg,
            avg_weight_kg=body.avgWeightKg,
        )
    )

