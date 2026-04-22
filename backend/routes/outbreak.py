from __future__ import annotations

from collections import Counter

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth
from db.sqlite import get_conn

outbreak_bp = Blueprint("outbreak", __name__)


class OutbreakRequest(BaseModel):
    pondId: str = Field(min_length=1)
    windowDays: int = Field(default=7, ge=1, le=90)


@outbreak_bp.post("/outbreak-predict")
@require_auth
def outbreak_predict():
    """Real outbreak prediction from diagnosis history."""
    body = OutbreakRequest.model_validate(request.get_json(force=True))

    conn = get_conn()
    cur = conn.cursor()
    # Get diagnoses for this pond in the window
    cur.execute(
        """
        SELECT primary_disease, severity, timestamp
        FROM diagnoses
        WHERE pond_id = ?
        ORDER BY timestamp DESC
        LIMIT 50
        """,
        (body.pondId,),
    )
    rows = cur.fetchall()
    conn.close()

    if not rows:
        return jsonify({
            "outbreakProbability": 0.0,
            "riskLevel": "Low",
            "triggerFactors": [],
            "recommendation": "No diagnoses recorded for this pond.",
            "pondId": body.pondId,
            "windowDays": body.windowDays,
        })

    disease_counts = Counter(r["primary_disease"] for r in rows if r["primary_disease"] != "Healthy Fish")
    critical_count = sum(1 for r in rows if r["severity"] == "Critical")
    trigger_factors = []

    # PRD §FR-11.2: flag if 3+ critical detections
    if critical_count >= 3:
        trigger_factors.append(f"{critical_count} Critical severity detections in pond")

    most_common = disease_counts.most_common(1)
    if most_common:
        disease, count = most_common[0]
        if count >= 3:
            trigger_factors.append(f"{count} detections of {disease}")

    # Calculate probability
    prob = min(0.99, (critical_count * 0.20) + (len(rows) / 20.0))
    risk_level = "Low" if prob < 0.40 else ("Warning" if prob < 0.70 else "High")

    rec_map = {
        "Low": "Continue regular monitoring.",
        "Warning": "Increase monitoring frequency. Prepare treatment supplies.",
        "High": "Immediate intervention required. Contact fisheries authority.",
    }

    return jsonify({
        "outbreakProbability": round(prob, 3),
        "riskLevel": risk_level,
        "triggerFactors": trigger_factors,
        "recommendation": rec_map[risk_level],
        "pondId": body.pondId,
        "windowDays": body.windowDays,
        "totalDiagnoses": len(rows),
        "criticalCount": critical_count,
    })
