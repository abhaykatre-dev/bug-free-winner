from __future__ import annotations

from flask import Blueprint, jsonify

from services.auth import require_auth

risk_bp = Blueprint("risk", __name__)


@risk_bp.get("/pond-risk/<pond_id>")
@require_auth
def pond_risk(pond_id: str):
    # Placeholder until persistence layer is wired.
    return jsonify(
        {
            "pondId": pond_id,
            "score": 100,
            "status": "Safe",
            "trend": "stable",
            "recentDetections": 0,
            "criticalCount": 0,
            "outbreakRisk": "Low",
        }
    )

