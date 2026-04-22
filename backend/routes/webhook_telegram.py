"""
Telegram webhook handler for inbound bot commands.
FishAI_PRD FR-12.5: /diagnose, /report, /pondstatus, /alert
"""
from __future__ import annotations

import logging

from flask import Blueprint, jsonify, request

log = logging.getLogger(__name__)
webhook_telegram_bp = Blueprint("webhook_telegram", __name__)


@webhook_telegram_bp.post("/webhook/telegram")
def telegram_webhook():
    """
    Receives updates from Telegram Bot API.
    Set webhook: POST https://api.telegram.org/bot{TOKEN}/setWebhook?url={YOUR_URL}/webhook/telegram
    """
    from services.settings import Settings
    from services.telegram import send_telegram_alert
    from db.sqlite import get_conn
    import json

    settings = Settings.from_env()
    if not settings.telegram_bot_token:
        return jsonify({"ok": False}), 200

    data = request.get_json(force=True) or {}
    message = data.get("message", {})
    chat_id = str(message.get("chat", {}).get("id", ""))
    text = (message.get("text") or "").strip().lower()

    if not chat_id or not text:
        return jsonify({"ok": True}), 200

    if text.startswith("/start"):
        send_telegram_alert(
            chat_id=chat_id,
            message=(
                "🐟 Welcome to AquaGuard AI!\n\n"
                "Available commands:\n"
                "/report — Get your latest diagnosis report\n"
                "/pondstatus — View pond risk summary\n"
                "/alert — Check outbreak alerts in your area\n"
                "/help — Show this message\n\n"
                "Upload a fish photo via the AquaGuard app to run a diagnosis."
            ),
        )

    elif text.startswith("/report"):
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT diagnosis_id, primary_disease, confidence, severity, timestamp "
            "FROM diagnoses ORDER BY timestamp DESC LIMIT 1"
        )
        row = cur.fetchone()
        conn.close()
        if row:
            from services.telegram import send_telegram_report
            send_telegram_report(chat_id=chat_id, detection_id=row["diagnosis_id"])
        else:
            send_telegram_alert(
                chat_id=chat_id,
                message="No diagnoses found yet. Upload a fish photo via the AquaGuard app first."
            )

    elif text.startswith("/pondstatus"):
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT pond_id, name, risk_score, risk_level, last_updated FROM ponds ORDER BY risk_score DESC LIMIT 5"
        )
        rows = cur.fetchall()
        conn.close()
        if rows:
            lines = ["🏊 Pond Risk Summary\n━━━━━━━━━━━━━━━━━━━"]
            emoji_map = {"Safe": "🟢", "Warning": "🟡", "Critical": "🔴"}
            for r in rows:
                e = emoji_map.get(r["risk_level"], "⚪")
                lines.append(f"{e} {r['name']}: {r['risk_level']} (score: {r['risk_score']})")
            send_telegram_alert(chat_id=chat_id, message="\n".join(lines))
        else:
            send_telegram_alert(chat_id=chat_id, message="No ponds registered yet. Register ponds via the AquaGuard app.")

    elif text.startswith("/alert"):
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT primary_disease, severity, COUNT(*) as cnt FROM diagnoses "
            "WHERE severity='Critical' GROUP BY primary_disease ORDER BY cnt DESC LIMIT 3"
        )
        rows = cur.fetchall()
        conn.close()
        if rows:
            lines = ["⚠️ Active Outbreak Alerts\n━━━━━━━━━━━━━━━━━━━"]
            for r in rows:
                lines.append(f"🔴 {r['primary_disease']}: {r['cnt']} Critical detection(s)")
            send_telegram_alert(chat_id=chat_id, message="\n".join(lines))
        else:
            send_telegram_alert(chat_id=chat_id, message="✅ No critical outbreak alerts at this time.")

    elif text.startswith("/help"):
        send_telegram_alert(
            chat_id=chat_id,
            message=(
                "🐟 AquaGuard AI Commands:\n"
                "/report — Latest diagnosis report\n"
                "/pondstatus — Pond risk summary\n"
                "/alert — Outbreak alerts\n"
                "/help — This message"
            )
        )
    else:
        send_telegram_alert(
            chat_id=chat_id,
            message="Unknown command. Type /help for available commands."
        )

    return jsonify({"ok": True}), 200
