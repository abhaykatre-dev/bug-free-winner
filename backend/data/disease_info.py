from __future__ import annotations


CLASSES = [
    "Healthy Fish",
    "Bacterial Red Disease",
    "Bacterial Gill Disease",
    "Bacterial Diseases – Aeromoniasis",
    "Fungal Diseases – Saprolegniasis",
    "Parasitic Diseases",
    "Viral Diseases – White Tail Disease",
]


_DISEASES: dict[str, dict] = {
    "Healthy Fish": {
        "category": "Healthy",
        "urgency": "healthy",
        "reasoning": "No visible disease cues detected in the image.",
        "causes": {"environmental": ["Good water quality"], "biological": []},
        "treatment": {"medicines": ["None required"], "preventive": ["Weekly water checks"]},
    },
    "Bacterial Red Disease": {
        "category": "Bacterial",
        "urgency": "treat",
        "reasoning": "Detected due to red hemorrhagic patterns on fins/body region.",
        "causes": {
            "environmental": ["Poor water quality", "Low dissolved oxygen", "High ammonia"],
            "biological": ["Common bacterial infection after stress/injury"],
        },
        "treatment": {
            "medicines": [
                {"name": "Oxytetracycline", "dose": "50 mg/L bath for 1 hour"},
                {"name": "Potassium permanganate", "dose": "2 ppm for 30 min"},
            ],
            "preventive": ["Improve aeration", "Reduce stocking density", "Partial water change"],
        },
    },
    "Bacterial Gill Disease": {
        "category": "Bacterial",
        "urgency": "treat",
        "reasoning": "Detected due to gill discoloration/necrosis cues.",
        "causes": {
            "environmental": ["High organic load", "Low oxygen"],
            "biological": ["Bacterial gill infection"],
        },
        "treatment": {
            "medicines": [{"name": "Oxytetracycline", "dose": "As per local vet guidance"}],
            "preventive": ["Improve filtration and aeration"],
        },
    },
    "Bacterial Diseases – Aeromoniasis": {
        "category": "Bacterial",
        "urgency": "isolate",
        "reasoning": "Detected due to ulceration/hemorrhage patterns consistent with Aeromoniasis.",
        "causes": {
            "environmental": ["Overcrowding", "Poor water quality"],
            "biological": ["Aeromonas hydrophila (common)"],
        },
        "treatment": {
            "medicines": [{"name": "Antibiotic treatment", "dose": "Requires expert consultation"}],
            "preventive": ["Immediate isolation", "Water quality correction"],
        },
    },
    "Fungal Diseases – Saprolegniasis": {
        "category": "Fungal",
        "urgency": "monitor",
        "reasoning": "Detected due to cotton-like fungal growth cues.",
        "causes": {
            "environmental": ["Injury", "Cold stress", "Poor hygiene"],
            "biological": ["Saprolegnia species (fungus)"],
        },
        "treatment": {
            "medicines": [{"name": "Salt bath", "dose": "As per standard aquaculture guidance"}],
            "preventive": ["Remove dead organic matter"],
        },
    },
    "Parasitic Diseases": {
        "category": "Parasitic",
        "urgency": "treat",
        "reasoning": "Detected due to skin irritation/spot patterns consistent with parasitic infection.",
        "causes": {
            "environmental": ["High stocking density"],
            "biological": ["External parasites"],
        },
        "treatment": {
            "medicines": [{"name": "Formalin bath", "dose": "Use with caution; consult expert"}],
            "preventive": ["Quarantine new stock"],
        },
    },
    "Viral Diseases – White Tail Disease": {
        "category": "Viral",
        "urgency": "isolate",
        "reasoning": "Detected due to tail whitening/necrosis cues.",
        "causes": {"environmental": ["Stress"], "biological": ["Viral pathogen (class-specific)"]},
        "treatment": {
            "medicines": [{"name": "Supportive care", "dose": "Isolate and consult expert"}],
            "preventive": ["Strict biosecurity", "Isolate affected pond"],
        },
    },
}


def disease_details(disease: str) -> dict:
    return _DISEASES.get(disease) or {
        "category": "Unknown",
        "urgency": "monitor",
        "reasoning": "No disease-specific metadata available.",
        "causes": {"environmental": [], "biological": []},
        "treatment": {"medicines": [], "preventive": []},
    }


def severity_from_confidence(disease: str, confidence: float) -> str:
    info = disease_details(disease)
    urgency = info.get("urgency")
    if urgency == "healthy":
        return "Mild"
    if urgency == "monitor":
        return "Moderate" if confidence >= 0.75 else "Mild"
    if urgency == "treat":
        return "High" if confidence >= 0.65 else "Moderate"
    if urgency == "isolate":
        return "Critical" if confidence >= 0.55 else "High"
    return "Moderate"


def trust_label(confidence: float) -> str:
    if confidence < 0.60:
        return "Low"
    if confidence < 0.80:
        return "Medium"
    return "High"

