from __future__ import annotations

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth
from data.economic import calculate_economic_loss
from data.disease_info import DEFAULT_MARKET_PRICES

economic_bp = Blueprint("economic", __name__)


class EconomicRequest(BaseModel):
    disease: str
    severity: str
    fishCount: int = Field(ge=0)
    avgWeightKg: float = Field(ge=0)
    marketPricePerKg: float | None = Field(default=None, ge=0)
    species: str | None = None


@economic_bp.post("/economic")
@require_auth
def economic():
    body = EconomicRequest.model_validate(request.get_json(force=True))
    result = calculate_economic_loss(
        disease=body.disease,
        fish_count=body.fishCount,
        market_price_per_kg=body.marketPricePerKg,
        avg_weight_kg=body.avgWeightKg,
        species=body.species,
    )
    return jsonify(result)


@economic_bp.get("/market-prices")
def market_prices():
    """Return RBI-adjusted default market prices per species."""
    return jsonify(DEFAULT_MARKET_PRICES)
