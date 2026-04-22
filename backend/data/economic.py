from __future__ import annotations


_MORTALITY_RATES: dict[str, dict[str, float]] = {
    "Healthy Fish": {"day0": 0.0, "day3": 0.0, "day7": 0.0, "day14": 0.0},
    "Bacterial Red Disease": {"day0": 0.10, "day3": 0.30, "day7": 0.55, "day14": 0.75},
    "Bacterial Gill Disease": {"day0": 0.15, "day3": 0.35, "day7": 0.60, "day14": 0.80},
    "Bacterial Diseases – Aeromoniasis": {
        "day0": 0.20,
        "day3": 0.45,
        "day7": 0.70,
        "day14": 0.90,
    },
    "Fungal Diseases – Saprolegniasis": {"day0": 0.05, "day3": 0.15, "day7": 0.30, "day14": 0.50},
    "Parasitic Diseases": {"day0": 0.10, "day3": 0.25, "day7": 0.45, "day14": 0.65},
    "Viral Diseases – White Tail Disease": {"day0": 0.30, "day3": 0.60, "day7": 0.85, "day14": 0.95},
}


def calculate_economic_loss(
    *,
    disease: str,
    fish_count: int,
    market_price_per_kg: float,
    avg_weight_kg: float,
) -> dict:
    rates = _MORTALITY_RATES.get(disease) or _MORTALITY_RATES["Bacterial Red Disease"]
    value_per_fish = avg_weight_kg * market_price_per_kg

    def calc(rate: float) -> int:
        return int(round(fish_count * rate * value_per_fish))

    # PRD-style fields
    return {
        "estimatedLossToday": calc(rates["day0"]),
        "lossIfDelayed3Days": calc(rates["day3"]),
        "lossIfDelayed7Days": calc(rates["day7"]),
        "lossIfDelayed14Days": calc(rates["day14"]),
        "mortalityRate": rates["day3"],
        "treatmentCost": int(round(fish_count * 0.024)),
    }

