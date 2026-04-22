from __future__ import annotations

from flask import Blueprint, jsonify
from services.auth import require_auth
from db.sqlite import get_conn

risk_bp = Blueprint("risk", __name__)


@risk_bp.get("/pond-risk/<pond_id>")
@require_auth
def pond_risk(pond_id: str):
    """Real pond risk score from diagnosis history."""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT primary_disease, severity, timestamp
        FROM diagnoses
        WHERE pond_id = ?
        ORDER BY timestamp DESC
        LIMIT 20
        """,
        (pond_id,),
    )
    rows = cur.fetchall()
    conn.close()

    sev_weights = {"Mild": 15, "Moderate": 50, "Critical": 90}
    if not rows:
        return jsonify({
            "pondId": pond_id,
            "score": 0,
            "status": "Safe",
            "trend": "stable",
            "recentDetections": 0,
            "criticalCount": 0,
            "outbreakRisk": "Low",
        })

    score = int(round(min(100, sum(sev_weights.get(r["severity"], 30) for r in rows) / len(rows))))
    status = "Safe" if score <= 30 else ("Warning" if score <= 70 else "Critical")
    critical_count = sum(1 for r in rows if r["severity"] == "Critical")

    # Trend: compare first half vs second half
    half = max(1, len(rows) // 2)
    recent_score = sum(sev_weights.get(r["severity"], 30) for r in rows[:half]) / half
    older_score = sum(sev_weights.get(r["severity"], 30) for r in rows[half:]) / half
    trend = "improving" if recent_score < older_score else ("declining" if recent_score > older_score else "stable")

    return jsonify({
        "pondId": pond_id,
        "score": score,
        "status": status,
        "trend": trend,
        "recentDetections": len(rows),
        "criticalCount": critical_count,
        "outbreakRisk": "High" if critical_count >= 3 else ("Medium" if critical_count >= 1 else "Low"),
    })
