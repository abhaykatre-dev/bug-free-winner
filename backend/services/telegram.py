"""
Telegram service — sends PRD §14.1 formatted report messages.
"""
from __future__ import annotations

import json
import logging

log = logging.getLogger(__name__)


def send_telegram_report(*, chat_id: str, detection_id: str) -> bool:
    """
    Build and send the full PRD-format diagnosis report to Telegram.
    FishAI_PRD §FR-12.3: disease, confidence, severity, treatment summary, economic loss, vet info.
    """
    from services.settings import Settings
    from db.sqlite import get_conn

    settings = Settings.from_env()
    if not settings.telegram_bot_token:
        log.warning("TELEGRAM_BOT_TOKEN not configured — skipping Telegram send")
        return False

    # Fetch diagnosis from SQLite
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT primary_disease, confidence, severity, reasoning,
               treatment_json, economic_loss_json, heatmap_image_b64
        FROM diagnoses WHERE diagnosis_id = ?
        """,
        (detection_id,),
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        log.warning("Detection %s not found in SQLite", detection_id)
        return False

    try:
        treatment = json.loads(row["treatment_json"] or "{}")
        economic = json.loads(row["economic_loss_json"] or "null")

        # Severity emoji
        sev_emoji = {"Mild": "🟡", "Moderate": "🟠", "Critical": "🔴"}.get(row["severity"], "⚪")
        confidence_pct = round(float(row["confidence"]) * 100, 1)

        # Treatment summary
        medicines = treatment.get("medicines", [])
        if medicines:
            if isinstance(medicines[0], dict):
                med_text = medicines[0].get("name", str(medicines[0]))
                dosage = medicines[0].get("dosage", "")
                med_line = f"💊 Treatment: {med_text}\n   Dosage: {dosage}"
            else:
                med_line = f"💊 Treatment: {medicines[0]}"
        else:
            med_line = "💊 Treatment: Consult aquaculture veterinarian"

        # Economic summary
        econ_line = ""
        if economic:
            loss14 = economic.get("revenue_loss_day14_inr", 0)
            cost = economic.get("treatment_cost_inr", 0)
            saving = economic.get("net_saving_inr", 0)
            econ_line = (
                f"\n💰 Economic Risk:\n"
                f"   Loss if untreated (14 days): ₹{loss14:,}\n"
                f"   Treatment cost: ₹{cost:,}\n"
                f"   Net saving: ₹{saving:,}"
            )

        message = (
            f"🐟 AquaGuard AI Diagnosis Report\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"🦠 Disease: {row['primary_disease']}\n"
            f"📊 Confidence: {confidence_pct}% | Severity: {sev_emoji} {row['severity']}\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"🔍 Reasoning: {row['reasoning'][:200]}...\n"
            f"{med_line}"
            f"{econ_line}\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"📋 Diagnosis ID: {detection_id}\n"
            f"⚠️ Always confirm with a registered aquaculture veterinarian."
        )

        from telegram import Bot
        bot = Bot(token=settings.telegram_bot_token)

        # Send heatmap image if available
        heatmap_b64 = row.get("heatmap_image_b64")
        if heatmap_b64:
            try:
                import base64
                import io
                img_bytes = base64.b64decode(heatmap_b64)
                bot.send_photo(
                    chat_id=chat_id,
                    photo=io.BytesIO(img_bytes),
                    caption=f"🗺️ Heatmap — {row['primary_disease']} ({confidence_pct}% confidence)",
                )
            except Exception as e:
                log.warning("Failed to send heatmap: %s", e)

        bot.send_message(chat_id=chat_id, text=message)
        return True

    except Exception as e:
        log.error("Telegram send_report failed: %s", e)
        return False


def send_telegram_alert(*, chat_id: str, message: str) -> bool:
    """Send a plain text alert message (for outbreak/pond-critical alerts)."""
    from services.settings import Settings
    settings = Settings.from_env()
    if not settings.telegram_bot_token:
        return False
    try:
        from telegram import Bot
        bot = Bot(token=settings.telegram_bot_token)
        bot.send_message(chat_id=chat_id, text=message)
        return True
    except Exception as e:
        log.error("Telegram alert failed: %s", e)
        return False
