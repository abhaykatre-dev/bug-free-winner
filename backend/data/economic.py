"""
Economic loss calculator — disease-specific mortality rates aligned with FishAI_PRD.md FR-09.
"""
from __future__ import annotations

from data.disease_info import DEFAULT_MARKET_PRICES

# Disease-specific mortality rates at each stage (fraction of stock that dies)
_MORTALITY_RATES: dict[str, dict[str, float]] = {
    "Healthy Fish": {"day0": 0.0, "day3": 0.0, "day7": 0.0, "day14": 0.0},
    "Bacterial Red Disease": {"day0": 0.05, "day3": 0.20, "day7": 0.45, "day14": 0.70},
    "Bacterial Gill Disease": {"day0": 0.08, "day3": 0.25, "day7": 0.50, "day14": 0.75},
    "Bacterial Diseases – Aeromoniasis": {"day0": 0.15, "day3": 0.40, "day7": 0.70, "day14": 0.90},
    "Fungal Diseases – Saprolegniasis": {"day0": 0.02, "day3": 0.08, "day7": 0.20, "day14": 0.40},
    "Parasitic Diseases": {"day0": 0.05, "day3": 0.18, "day7": 0.38, "day14": 0.60},
    "Viral Diseases – White Tail Disease": {"day0": 0.20, "day3": 0.55, "day7": 0.80, "day14": 0.95},
}

# Treatment cost per fish (₹)
_TREATMENT_COST_PER_FISH: dict[str, float] = {
    "Healthy Fish": 0.0,
    "Bacterial Red Disease": 0.30,
    "Bacterial Gill Disease": 0.35,
    "Bacterial Diseases – Aeromoniasis": 1.50,   # specialist antibiotic
    "Fungal Diseases – Saprolegniasis": 0.15,
    "Parasitic Diseases": 0.25,
    "Viral Diseases – White Tail Disease": 2.00,  # includes biosecurity and culling cost
}


def _get_rates(disease: str) -> dict[str, float]:
    """Return mortality rates, falling back to Bacterial Red Disease rates for unknown diseases."""
    return _MORTALITY_RATES.get(disease) or _MORTALITY_RATES["Bacterial Red Disease"]


def calculate_economic_loss(
    *,
    disease: str,
    fish_count: int,
    market_price_per_kg: float | None = None,
    avg_weight_kg: float = 0.5,
    species: str | None = None,
) -> dict:
    """
    PRD FR-09 compliant calculator.

    Returns:
        fish_at_risk, estimated_deaths_day{0,3,7,14},
        revenue_loss_day{0,3,7,14}_inr, treatment_cost_inr, net_saving_inr, mortality_rate
    """
    # Resolve market price
    if market_price_per_kg is None or market_price_per_kg <= 0:
        market_price_per_kg = DEFAULT_MARKET_PRICES.get(species or "", 120.0)

    rates = _get_rates(disease)
    value_per_fish = avg_weight_kg * market_price_per_kg

    def deaths(rate: float) -> int:
        return int(round(fish_count * rate))

    def loss_inr(rate: float) -> int:
        return int(round(deaths(rate) * value_per_fish))

    treatment_cost = int(round(fish_count * _TREATMENT_COST_PER_FISH.get(disease, 0.30)))
    revenue_loss_day14 = loss_inr(rates["day14"])
    net_saving = max(0, revenue_loss_day14 - treatment_cost)

    return {
        "fish_at_risk": fish_count,
        "estimated_deaths_day0": deaths(rates["day0"]),
        "estimated_deaths_day3": deaths(rates["day3"]),
        "estimated_deaths_day7": deaths(rates["day7"]),
        "estimated_deaths_day14": deaths(rates["day14"]),
        "revenue_loss_day0_inr": loss_inr(rates["day0"]),
        "revenue_loss_day3_inr": loss_inr(rates["day3"]),
        "revenue_loss_day7_inr": loss_inr(rates["day7"]),
        "revenue_loss_day14_inr": revenue_loss_day14,
        "treatment_cost_inr": treatment_cost,
        "net_saving_inr": net_saving,
        "mortality_rate_day3": rates["day3"],
        "avg_weight_kg": avg_weight_kg,
        "market_price_per_kg": market_price_per_kg,
    }
