"""
Telegram alert service — uses direct Bot API HTTP calls (no library dependency).
"""
from __future__ import annotations
import logging
import requests

log = logging.getLogger(__name__)


def send_telegram_message(chat_id: str, message: str, settings=None) -> bool:
    """Send a plain text message. Called from api_prd.py alert/telegram route."""
    token = None
    if settings:
        token = getattr(settings, 'telegram_bot_token', None)
    if not token:
        import os
        token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        log.warning("TELEGRAM_BOT_TOKEN not configured")
        return False
    return _send_via_api(token, chat_id, message)


def send_telegram_alert(*, chat_id: str, message: str) -> bool:
    """Send a plain text alert (for outbreak/pond-critical alerts)."""
    import os
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        return False
    return _send_via_api(token, chat_id, message)


def send_telegram_report(*, chat_id: str, detection_id: str) -> bool:
    """Build and send the full PRD-format diagnosis report to Telegram."""
    import json
    import os

    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        log.warning("TELEGRAM_BOT_TOKEN not configured")
        return False

    try:
        from db.sqlite import get_conn
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT primary_disease, confidence, severity, reasoning,
                   treatment_json, economic_loss_json
            FROM diagnoses WHERE diagnosis_id = ?
            """,
            (detection_id,),
        )
        row = cur.fetchone()
        conn.close()

        if not row:
            log.warning("Detection %s not found in SQLite", detection_id)
            return False

        treatment = json.loads(row["treatment_json"] or "{}")
        economic   = json.loads(row["economic_loss_json"] or "null")

        sev_emoji = {"Mild": "🟡", "Moderate": "🟠", "Critical": "🔴"}.get(row["severity"], "⚪")
        confidence_pct = round(float(row["confidence"]) * 100, 1)

        medicines = treatment.get("medicines", [])
        if medicines:
            m = medicines[0]
            med_name = m.get("name", str(m)) if isinstance(m, dict) else str(m)
            med_line = f"💊 Treatment: {med_name}"
        else:
            med_line = "💊 Treatment: Consult aquaculture veterinarian"

        econ_line = ""
        if economic:
            econ_line = (
                f"\n💰 Economic Risk:"
                f"\n   Loss if untreated: ₹{economic.get('revenue_loss_day14_inr', 0):,}"
                f"\n   Treatment cost: ₹{economic.get('treatment_cost_inr', 0):,}"
            )

        message = (
            f"🐟 AquaGuard AI Diagnosis Report\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"🦠 Disease: {row['primary_disease']}\n"
            f"📊 Confidence: {confidence_pct}% | Severity: {sev_emoji} {row['severity']}\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"🔍 {str(row['reasoning'])[:200]}...\n"
            f"{med_line}{econ_line}\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"📋 Case: {detection_id}\n"
            f"⚠️ Confirm with a registered aquaculture veterinarian."
        )
        return _send_via_api(token, chat_id, message)

    except Exception as e:
        log.error("Telegram send_report failed: %s", e)
        return False


def _send_via_api(token: str, chat_id: str, message: str) -> bool:
    """Direct Telegram Bot API call — no python-telegram-bot library needed."""
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        resp = requests.post(
            url,
            json={"chat_id": str(chat_id), "text": message, "parse_mode": ""},
            timeout=10,
        )
        data = resp.json()
        if data.get("ok"):
            log.info("Telegram message sent to chat_id=%s", chat_id)
            return True
        log.warning("Telegram API error: %s", data.get("description"))
        return False
    except Exception as e:
        log.error("Telegram HTTP call failed: %s", e)
        return False
