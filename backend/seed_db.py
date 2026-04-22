"""
Seed script: inserts 5 pre-built diagnosis records into SQLite so that
Similar Cases, Outbreak, and History widgets show real data on first run.
Run once: python3 seed_db.py
"""
import json, uuid, sys, os
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(__file__))

from db.sqlite import get_conn, init_db

SEEDS = [
    {
        "disease": "Bacterial Red Disease",
        "confidence": 0.9723,
        "severity": "Critical",
        "reasoning": "Detected red hemorrhagic spots and patches on the dorsal fin and lateral body surface.",
        "causes": {"biological": ["Aeromonas hydrophila"], "environmental": ["Low DO < 3 mg/L", "High ammonia"]},
        "treatment": {"medicines": [{"name": "Oxytetracycline", "dose": "55 mg/kg", "frequency": "Once daily"}]},
        "economic_loss": {"revenue_loss_day14_inr": 84000, "treatment_cost_inr": 4000, "net_saving_inr": 80000},
        "similar_cases": [],
        "lat": 21.14, "lng": 79.08, "pond_id": "P-001",
    },
    {
        "disease": "Fungal Diseases – Saprolegniasis",
        "confidence": 0.8841,
        "severity": "Warning",
        "reasoning": "White cotton-like tufts observed on skin and fin edges. Consistent with Saprolegnia water mould infection.",
        "causes": {"biological": ["Saprolegnia spp."], "environmental": ["Mechanical injury", "Cold water stress"]},
        "treatment": {"medicines": [{"name": "Malachite Green", "dose": "0.1 ppm bath", "frequency": "Every 3 days"}]},
        "economic_loss": {"revenue_loss_day14_inr": 32000, "treatment_cost_inr": 2000, "net_saving_inr": 30000},
        "similar_cases": [],
        "lat": 21.11, "lng": 79.05, "pond_id": "P-002",
    },
    {
        "disease": "Bacterial Diseases – Aeromoniasis",
        "confidence": 0.9102,
        "severity": "Critical",
        "reasoning": "Visible ulcers, abdominal distension (dropsy), and fin base reddening detected. Consistent with Aeromoniasis.",
        "causes": {"biological": ["Aeromonas hydrophila", "A. salmonicida"], "environmental": ["Overcrowding", "Poor water exchange"]},
        "treatment": {"medicines": [{"name": "Ampicillin", "dose": "50 mg/kg", "frequency": "Twice daily"}]},
        "economic_loss": {"revenue_loss_day14_inr": 61000, "treatment_cost_inr": 3500, "net_saving_inr": 57500},
        "similar_cases": [],
        "lat": 21.13, "lng": 79.11, "pond_id": "P-001",
    },
    {
        "disease": "Healthy Fish",
        "confidence": 0.9918,
        "severity": "Safe",
        "reasoning": "No disease-specific visual cues. Fish appear healthy with normal colouration and intact fins.",
        "causes": {"biological": [], "environmental": ["Optimal water quality", "DO > 6 mg/L"]},
        "treatment": {"medicines": []},
        "economic_loss": None,
        "similar_cases": [],
        "lat": 21.15, "lng": 79.07, "pond_id": "P-003",
    },
    {
        "disease": "Parasitic Diseases",
        "confidence": 0.8234,
        "severity": "Warning",
        "reasoning": "White spots on fins and body. Fish observed scratching against tank walls. Consistent with Ich (Ichthyophthirius multifiliis).",
        "causes": {"biological": ["Ichthyophthirius multifiliis", "Trichodina spp."], "environmental": ["Temperature fluctuation", "New fish introduced without quarantine"]},
        "treatment": {"medicines": [{"name": "Formalin Bath", "dose": "25 ppm", "frequency": "Every 2 days"}]},
        "economic_loss": {"revenue_loss_day14_inr": 28000, "treatment_cost_inr": 1800, "net_saving_inr": 26200},
        "similar_cases": [],
        "lat": 21.12, "lng": 79.09, "pond_id": "P-002",
    },
]

def seed():
    init_db()
    conn = get_conn()
    cur = conn.cursor()

    # Check if already seeded
    cur.execute("SELECT COUNT(*) FROM diagnoses")
    count = cur.fetchone()[0]
    if count >= 5:
        print(f"DB already has {count} records — skipping seed.")
        conn.close()
        return

    inserted = 0
    for s in SEEDS:
        dx_id = f"dx_seed_{uuid.uuid4().hex[:6]}"
        ts = datetime.now(timezone.utc).isoformat()
        cur.execute("""
            INSERT INTO diagnoses (
                diagnosis_id, timestamp, pond_id, user_id,
                primary_disease, confidence, severity,
                top_predictions_json, heatmap_image_b64, bbox_json,
                reasoning, causes_json, treatment_json, progression_json,
                similar_cases_json, economic_loss_json, action_timeline_json,
                language, lat, lng
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            dx_id, ts, s.get("pond_id"), "seed_user",
            s["disease"], s["confidence"], s["severity"],
            json.dumps([{"disease": s["disease"], "confidence": s["confidence"], "severity": s["severity"]}]),
            None, None,
            s["reasoning"],
            json.dumps(s["causes"]),
            json.dumps(s["treatment"]),
            json.dumps([]),
            json.dumps([]),
            json.dumps(s["economic_loss"]) if s["economic_loss"] else None,
            json.dumps([]),
            "en", s["lat"], s["lng"],
        ))
        inserted += 1
        print(f"  ✓ Inserted: {s['disease']} ({s['severity']}) — {dx_id}")

    conn.commit()
    conn.close()
    print(f"\n✅ Seeded {inserted} records into SQLite DB.")

if __name__ == "__main__":
    seed()
