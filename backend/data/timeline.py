from __future__ import annotations


def generate_action_timeline(
    *, disease: str, severity: str, pond_size_m2: float | None
) -> list[dict]:
    # A simple robust template that works even without pond sizing.
    size_factor = 1.0
    if pond_size_m2 and pond_size_m2 > 0:
        size_factor = pond_size_m2 / 100.0

    def dose(base: str) -> str:
        if "ppm" in base or "mg/L" in base:
            return base
        return base

    # Keep the contract stable with day keys used in PRD.
    return [
        {
            "day": 0,
            "title": "Immediate actions",
            "tasks": ["Isolate visibly sick fish (if possible)", "Stop overfeeding", "Increase aeration"],
            "medicine": "None",
            "dosage": None,
            "waterCheck": "Check dissolved oxygen, ammonia, pH",
            "observationNote": "Take photos; re-scan after 24 hours",
            "escalationTrigger": "If sudden deaths or rapid spread → consult expert",
        },
        {
            "day": 1,
            "title": "Start treatment",
            "tasks": ["Begin disease-specific treatment", "Partial water change (20–30%)"],
            "medicine": f"Treatment for {disease}",
            "dosage": dose(f"Scale factor ~{size_factor:.2f}× (pond size / 100m²)"),
            "waterCheck": "Maintain stable temperature and oxygen",
            "observationNote": f"Severity: {severity}. Monitor appetite and swimming behavior.",
            "escalationTrigger": "If symptoms worsen by Day 3 → consult expert",
        },
        {
            "day": 3,
            "title": "Re-assess and repeat",
            "tasks": ["Repeat treatment if indicated", "Remove dead fish promptly"],
            "medicine": f"Treatment for {disease}",
            "dosage": None,
            "waterCheck": "Re-check ammonia and nitrite",
            "observationNote": "Re-scan a representative fish image",
            "escalationTrigger": "If confidence stays low or deaths increase → consult expert",
        },
        {
            "day": 7,
            "title": "Stabilize and prevent recurrence",
            "tasks": ["Improve biosecurity", "Quarantine new stock", "Optimize feeding"],
            "medicine": "Preventive steps",
            "dosage": None,
            "waterCheck": "Weekly water quality checklist",
            "observationNote": "Continue monitoring for 1 week",
            "escalationTrigger": "If repeated detections → consider outbreak protocol",
        },
        {
            "day": 14,
            "title": "Recovery check",
            "tasks": ["Final health check", "Document changes in pond management"],
            "medicine": "None",
            "dosage": None,
            "waterCheck": "Record baseline values (pH, O2, ammonia, temp)",
            "observationNote": "If unresolved → schedule expert review",
            "escalationTrigger": "Persistent symptoms → expert escalation",
        },
    ]

