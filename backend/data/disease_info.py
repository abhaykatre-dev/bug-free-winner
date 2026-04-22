"""
Comprehensive disease knowledge base for the 7 fish disease classes
present in the training dataset.

Aligned with FishAI_PRD.md functional requirements:
- FR-03: Cause Identification (env + biological + water quality tests)
- FR-04: Treatment (medicines with cost_band, preventive steps, disclaimer)
- FR-08: Trust Meter severity bands (≤33% Mild, ≤66% Moderate, >66% Critical)
- FR-09: Economic loss (disease-specific mortality rates)
"""
from __future__ import annotations

# PRD §FR-01.4 severity bands based on model confidence
#   Mild     : confidence ≤ 0.33
#   Moderate : confidence ≤ 0.66
#   Critical : confidence  > 0.66
# These are used globally; override per-disease is NOT applied.

SEVERITY_MILD_THRESHOLD = 0.33
SEVERITY_MODERATE_THRESHOLD = 0.66

# ---- 7 training classes (folder names → normalised display names) ----------
# Maps folder name → canonical display name
FOLDER_TO_CLASS: dict[str, str] = {
    "Healthy Fish": "Healthy Fish",
    "Bacterial Red disease": "Bacterial Red Disease",
    "Bacterial diseases - Aeromoniasis": "Bacterial Diseases – Aeromoniasis",
    "Bacterial gill disease": "Bacterial Gill Disease",
    "Fungal diseases Saprolegniasis": "Fungal Diseases – Saprolegniasis",
    "Parasitic diseases": "Parasitic Diseases",
    "Viral diseases White tail disease": "Viral Diseases – White Tail Disease",
}

# Canonical class list (order matches training label sort)
CLASSES: list[str] = sorted(FOLDER_TO_CLASS.values())

# ---- Full knowledge base ---------------------------------------------------
_KB: dict[str, dict] = {
    "Healthy Fish": {
        "category": "Healthy",
        "urgency": "healthy",
        "reasoning": (
            "No disease-specific visual cues detected. Fish appear healthy with normal coloration, "
            "intact fins, and no visible lesions or abnormal patches."
        ),
        "causes": {
            "environmental": ["Good water quality", "Optimal dissolved oxygen (≥5 mg/L)", "Normal pH (6.5–8.5)"],
            "biological": [],
            "water_quality_tests": [],
        },
        "treatment": {
            "medicines": [],
            "preventive_steps": [
                "Perform weekly water quality checks (pH, ammonia, DO)",
                "Quarantine new stock for 14 days before introducing to pond",
                "Maintain stocking density within safe limits",
            ],
            "disclaimer": "Continue regular health monitoring.",
        },
    },

    "Bacterial Red Disease": {
        "category": "Bacterial",
        "urgency": "treat",
        "reasoning": (
            "Detected due to red hemorrhagic spots and patches on the dorsal fin, lateral body surface, "
            "and around the operculum. Skin may appear ulcerated in advanced stages."
        ),
        "causes": {
            "environmental": [
                "Poor water quality (high ammonia/nitrite)",
                "Low dissolved oxygen (<3 mg/L)",
                "Overcrowding and physical injury",
                "Sudden temperature fluctuations",
            ],
            "biological": [
                "Aeromonas hydrophila or Aeromonas salmonicida (primary causative agent)",
                "Opportunistic infection after stress or injury",
            ],
            "water_quality_tests": [
                "Measure dissolved oxygen — target ≥5 mg/L",
                "Test ammonia — should be <0.05 mg/L",
                "Test nitrite — should be <0.1 mg/L",
                "Check pH — target 6.5–8.0",
            ],
        },
        "treatment": {
            "medicines": [
                {
                    "name": "Oxytetracycline",
                    "brand": "Terramycin Aqua",
                    "dosage": "50–75 mg/L bath for 1 hour; or 55 mg/kg feed for 10 days",
                    "cost_band": "Low (<₹200)",
                    "prescription_required": False,
                },
                {
                    "name": "Potassium Permanganate (KMnO₄)",
                    "brand": "Generic (agricultural grade)",
                    "dosage": "2 ppm pond treatment for 30 minutes; repeat after 3 days",
                    "cost_band": "Very Low (<₹50)",
                    "prescription_required": False,
                },
                {
                    "name": "Salt Bath (NaCl)",
                    "brand": "Table Salt",
                    "dosage": "3–5 g/L for 10–15 minutes",
                    "cost_band": "Very Low (<₹50)",
                    "prescription_required": False,
                },
            ],
            "preventive_steps": [
                "Improve aeration immediately — install paddlewheel aerators if available",
                "Partial water change (25–30%) to reduce ammonia",
                "Reduce feeding rate by 50% during treatment",
                "Isolate visibly infected fish in a separate tank",
            ],
            "disclaimer": (
                "Consult a registered aquaculture veterinarian before administering antibiotics. "
                "Antibiotic resistance is increasing; vet confirmation of pathogen is recommended."
            ),
        },
        "default_market_prices_inr_per_kg": {"Tilapia": 110, "Carp": 95, "Catfish": 130},
    },

    "Bacterial Gill Disease": {
        "category": "Bacterial",
        "urgency": "treat",
        "reasoning": (
            "Detected due to gill discoloration (pale or dark brown), swollen gill lamellae, "
            "and increased mucus production. Fish may be seen gasping at the surface."
        ),
        "causes": {
            "environmental": [
                "High organic load and decaying matter in pond",
                "Low dissolved oxygen (<3 mg/L) — fish compensate by surfacing",
                "High ammonia and nitrite levels",
                "Poor pond aeration",
            ],
            "biological": [
                "Flavobacterium branchiophilum (primary agent)",
                "Secondary opportunistic bacterial colonization of gills",
            ],
            "water_quality_tests": [
                "Dissolved oxygen — must be ≥5 mg/L; gill disease worsens rapidly below 3 mg/L",
                "Ammonia (TAN) — target <0.05 mg/L",
                "Turbidity — high turbidity indicates high organic load",
                "Temperature — warmer water holds less oxygen",
            ],
        },
        "treatment": {
            "medicines": [
                {
                    "name": "Oxytetracycline",
                    "brand": "Terramycin Aqua",
                    "dosage": "55 mg/kg body weight in feed for 10 days",
                    "cost_band": "Low (<₹200)",
                    "prescription_required": False,
                },
                {
                    "name": "Benzalkonium Chloride",
                    "brand": "Roccal-D (aqua grade)",
                    "dosage": "0.5–1 ppm pond treatment",
                    "cost_band": "Medium (₹200–₹1000)",
                    "prescription_required": True,
                },
            ],
            "preventive_steps": [
                "Increase aeration immediately",
                "Remove decaying organic matter from pond bottom",
                "Reduce feeding by 60% until gills recover",
                "30% partial water change with clean water",
            ],
            "disclaimer": (
                "Gill disease can cause rapid mortality if oxygen levels are not corrected. "
                "Consult a vet if mortality exceeds 5% of stock within 24 hours."
            ),
        },
    },

    "Bacterial Diseases – Aeromoniasis": {
        "category": "Bacterial",
        "urgency": "isolate",
        "reasoning": (
            "Detected due to deep ulceration, hemorrhagic patches on the abdomen and flanks, "
            "fin erosion, and possible exophthalmia (popeye). Highly contagious bacterial infection."
        ),
        "causes": {
            "environmental": [
                "Severe overcrowding causing chronic stress",
                "Poor water quality — high ammonia/nitrite/BOD",
                "Sudden temperature shock (>5°C change)",
                "Low dissolved oxygen for extended periods",
            ],
            "biological": [
                "Aeromonas hydrophila (motile Aeromonas septicemia — MAS)",
                "Rapidly spreading via water; highly virulent under stress conditions",
                "Secondary fungal infection (Saprolegnia) may co-occur on ulcers",
            ],
            "water_quality_tests": [
                "Ammonia — must be <0.05 mg/L; likely elevated",
                "pH — acidic water (pH<6) accelerates bacterial virulence",
                "Dissolved oxygen — restore to ≥6 mg/L urgently",
                "BOD (Biological Oxygen Demand) — high BOD indicates organic overload",
            ],
        },
        "treatment": {
            "medicines": [
                {
                    "name": "Florfenicol",
                    "brand": "Aquaflor",
                    "dosage": "10 mg/kg body weight per day in feed for 10 days",
                    "cost_band": "Specialist Required",
                    "prescription_required": True,
                },
                {
                    "name": "Enrofloxacin",
                    "brand": "Baytril Aqua",
                    "dosage": "5–10 mg/kg body weight per day for 7–10 days",
                    "cost_band": "Specialist Required",
                    "prescription_required": True,
                },
                {
                    "name": "Salt + Potassium Permanganate (initial disinfection)",
                    "brand": "Table Salt + KMnO₄",
                    "dosage": "Salt: 5 g/L; KMnO₄: 2 ppm for 30 min — interim measure only",
                    "cost_band": "Very Low (<₹50)",
                    "prescription_required": False,
                },
            ],
            "preventive_steps": [
                "IMMEDIATELY isolate all infected fish to a separate containment area",
                "Do not share equipment between ponds without disinfection",
                "Reduce stocking density in affected pond by 30–50%",
                "Disinfect nets and tools with 200 ppm chlorine solution",
                "Notify local fisheries extension officer if mortality exceeds 10%",
            ],
            "disclaimer": (
                "Aeromoniasis requires prescription antibiotics and immediate expert consultation. "
                "Self-treating with over-the-counter products is unlikely to be effective. "
                "Contact your district fisheries officer or aquaculture vet immediately."
            ),
        },
    },

    "Fungal Diseases – Saprolegniasis": {
        "category": "Fungal",
        "urgency": "monitor",
        "reasoning": (
            "Detected due to white or grey cotton-wool-like tufts growing on the body surface, "
            "fins, or gills. Fungal hyphae are visible as branching filaments on affected tissue."
        ),
        "causes": {
            "environmental": [
                "Cold water temperatures (<15°C) favour Saprolegnia growth",
                "Physical injury (handling, spawning, predation wounds)",
                "Poor water quality enabling secondary infection of wounds",
                "High organic matter (dead fish, uneaten feed)",
            ],
            "biological": [
                "Saprolegnia spp. (water mould, oomycete — not a true fungus)",
                "Primarily infects wounds, eggs, and immunocompromised fish",
                "Not typically primary pathogen — usually secondary to injury or other disease",
            ],
            "water_quality_tests": [
                "Temperature — Saprolegnia thrives below 15°C; warm water helps recovery",
                "Organic matter — remove dead fish and excess feed immediately",
                "Dissolved oxygen — maintain ≥5 mg/L to support immune response",
            ],
        },
        "treatment": {
            "medicines": [
                {
                    "name": "Salt Bath (NaCl)",
                    "brand": "Rock Salt / Table Salt",
                    "dosage": "5 g/L for 15 minutes; or 3 g/L as indefinite pond treatment",
                    "cost_band": "Very Low (<₹50)",
                    "prescription_required": False,
                },
                {
                    "name": "Potassium Permanganate (KMnO₄)",
                    "brand": "Generic",
                    "dosage": "2 ppm for 30 minutes; repeat every 3 days for 2 weeks",
                    "cost_band": "Very Low (<₹50)",
                    "prescription_required": False,
                },
                {
                    "name": "Malachite Green (if legally permitted in your region)",
                    "brand": "Aqua-MG",
                    "dosage": "0.1 mg/L pond treatment — check local regulations first",
                    "cost_band": "Low (<₹200)",
                    "prescription_required": True,
                },
            ],
            "preventive_steps": [
                "Remove dead fish and debris immediately — they serve as infection reservoir",
                "Handle fish gently to minimize injury during harvest or transfer",
                "Maintain water temperature above 20°C where possible",
                "Treat wounds on broodstock before returning to pond",
            ],
            "disclaimer": (
                "Malachite Green is banned in food fish in some countries including India. "
                "Verify local regulations before use. Salt and KMnO₄ are the safest alternatives."
            ),
        },
    },

    "Parasitic Diseases": {
        "category": "Parasitic",
        "urgency": "treat",
        "reasoning": (
            "Detected due to white spots (Ich), increased mucus, skin irritation, "
            "flashing behavior (fish rubbing against surfaces), and fin/scale damage "
            "consistent with external parasitic infestation."
        ),
        "causes": {
            "environmental": [
                "High stocking density facilitating parasite transmission",
                "Poor biosecurity — introduction of untreated new fish",
                "Organic-rich water providing substrate for parasite lifecycle",
                "Temperature between 22–26°C favours Ich lifecycle",
            ],
            "biological": [
                "Ichthyophthirius multifiliis (Ich/White Spot — most common)",
                "Trichodina spp. (circular ciliate parasite)",
                "Argulus spp. (fish lice — visible to naked eye)",
                "Dactylogyrus / Gyrodactylus (gill/skin flukes)",
            ],
            "water_quality_tests": [
                "pH — target 7.0–8.0 for most treatments to be effective",
                "Temperature — Ich lifecycle is temperature-dependent; 25–26°C kills tomont stage in 4 days",
                "Salinity — salt treatment efficacy depends on species tolerance",
            ],
        },
        "treatment": {
            "medicines": [
                {
                    "name": "Salt Bath (NaCl)",
                    "brand": "Table Salt / Rock Salt",
                    "dosage": "3–5 g/L for 10 minutes; or maintain 1–2 g/L in pond as prophylaxis",
                    "cost_band": "Very Low (<₹50)",
                    "prescription_required": False,
                },
                {
                    "name": "Formalin",
                    "brand": "Commercial 37% Formaldehyde",
                    "dosage": "25–50 ppm pond treatment for 1 hour (open-top tank with aeration)",
                    "cost_band": "Low (<₹200)",
                    "prescription_required": False,
                },
                {
                    "name": "Malachite Green + Formalin (for Ich)",
                    "brand": "QuickCure / AquaCure ICH",
                    "dosage": "0.1 mg/L MG + 25 ppm Formalin — highly effective against Ich",
                    "cost_band": "Low (<₹200)",
                    "prescription_required": True,
                },
                {
                    "name": "Diflubenzuron (for Argulus/lice)",
                    "brand": "Dimilin Aqua",
                    "dosage": "0.03 ppm pond treatment; repeat after 7 days",
                    "cost_band": "Medium (₹200–₹1000)",
                    "prescription_required": True,
                },
            ],
            "preventive_steps": [
                "Quarantine all new fish for 14 days before introducing to pond",
                "Prophylactic salt dip (3 g/L for 5 min) for all incoming fish",
                "Maintain good water quality and avoid overcrowding",
                "Remove intermediate hosts where applicable (snails for flukes)",
            ],
            "disclaimer": (
                "Formalin and Malachite Green should be used with adequate aeration and ventilation. "
                "Overtreatment can cause acute toxicity. Consult a vet for heavy infestations."
            ),
        },
    },

    "Viral Diseases – White Tail Disease": {
        "category": "Viral",
        "urgency": "isolate",
        "reasoning": (
            "Detected due to progressive whitening/necrosis of the tail and caudal fin, "
            "opaque muscle tissue, erratic swimming behavior, and high rapid mortality rate. "
            "White Tail Disease (WTD) is caused by a nodavirus."
        ),
        "causes": {
            "environmental": [
                "Stress from poor water quality, overcrowding, or handling",
                "Introduction of infected fish or contaminated water",
                "High water temperature may accelerate viral replication",
            ],
            "biological": [
                "Macrobrachium rosenbergii nodavirus (MrNV) — targets freshwater prawn and some fish species",
                "Extra small virus (XSV) often co-infects",
                "Highly contagious; horizontal transmission via water",
                "No antiviral treatment available — supportive care only",
            ],
            "water_quality_tests": [
                "Dissolved oxygen — maintain ≥6 mg/L to reduce stress",
                "Ammonia — must be <0.05 mg/L; stress worsens viral disease outcomes",
                "Disinfect all equipment and nets between ponds",
            ],
        },
        "treatment": {
            "medicines": [
                {
                    "name": "No antiviral drug available — supportive care only",
                    "brand": "N/A",
                    "dosage": "Isolate affected stock; treat secondary bacterial infections",
                    "cost_band": "Specialist Required",
                    "prescription_required": True,
                },
                {
                    "name": "Salt Bath (NaCl) — for secondary infections",
                    "brand": "Rock Salt",
                    "dosage": "3 g/L for 10 minutes to reduce secondary bacterial load",
                    "cost_band": "Very Low (<₹50)",
                    "prescription_required": False,
                },
                {
                    "name": "Oxytetracycline — for secondary bacterial co-infection",
                    "brand": "Terramycin Aqua",
                    "dosage": "50 mg/L bath for 1 hour to control secondary bacteria",
                    "cost_band": "Low (<₹200)",
                    "prescription_required": False,
                },
            ],
            "preventive_steps": [
                "IMMEDIATELY isolate all infected fish and cull if mortality is high",
                "Disinfect pond with lime (25 kg/1000 m²) after outbreak",
                "Do not restock from affected hatcheries without PCR testing",
                "Strict biosecurity — no shared nets, pumps, or vessels between ponds",
                "Report to district fisheries authority — WTD is a notifiable disease",
            ],
            "disclaimer": (
                "White Tail Disease has no cure. Culling and strict biosecurity are the only effective "
                "control measures. Contact your state fisheries department and an aquaculture vet immediately."
            ),
        },
    },
}


# --------------------------------------------------------------------------- #
#  Public API
# --------------------------------------------------------------------------- #
def disease_details(disease: str) -> dict:
    """Return full knowledge base entry. Falls back to generic placeholder."""
    # Try exact match
    if disease in _KB:
        return _KB[disease]
    # Try folder-name mapping
    canonical = FOLDER_TO_CLASS.get(disease)
    if canonical and canonical in _KB:
        return _KB[canonical]
    # Unknown
    return {
        "category": "Unknown",
        "urgency": "monitor",
        "reasoning": "No disease-specific information available in knowledge base.",
        "causes": {"environmental": [], "biological": [], "water_quality_tests": []},
        "treatment": {
            "medicines": [],
            "preventive_steps": ["Consult an aquaculture veterinarian"],
            "disclaimer": "Seek expert consultation.",
        },
    }


def severity_from_confidence(confidence: float) -> str:
    """PRD FR-01.4: confidence → Mild / Moderate / Critical."""
    if confidence <= SEVERITY_MILD_THRESHOLD:
        return "Mild"
    if confidence <= SEVERITY_MODERATE_THRESHOLD:
        return "Moderate"
    return "Critical"


def trust_label(confidence: float) -> str:
    """PRD FR-08: confidence → Low / Moderate / High."""
    if confidence < 0.60:
        return "Low"
    if confidence < 0.80:
        return "Moderate"
    return "High"


def trust_message(confidence: float) -> str:
    label = trust_label(confidence)
    if label == "Low":
        return "Low confidence — please consult a veterinarian"
    if label == "Moderate":
        return "Moderate confidence — cross-check with the similar cases panel"
    return "High confidence — follow treatment plan and monitor"


def urgency_from_disease(disease: str) -> str:
    return disease_details(disease).get("urgency", "monitor")


# Default RBI-adjusted approximate market prices (₹/kg) — overridable by user
DEFAULT_MARKET_PRICES: dict[str, float] = {
    "Rohu": 130,
    "Catla": 140,
    "Tilapia": 110,
    "Catfish": 140,
    "Carp": 100,
    "Mrigal": 120,
    "Pangasius": 90,
    "Hilsa": 600,
    "Prawns": 400,
    "Shrimp": 350,
}
