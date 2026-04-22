from __future__ import annotations

from services.settings import Settings


def send_telegram_report(*, chat_id: str, detection_id: str) -> bool:
    """
    Minimal implementation: sends a short message.
    A richer message can be built once persistence is wired (fetch detection payload by id).
    """
    settings = Settings.from_env()
    if not settings.telegram_bot_token:
        return False

    try:
        from telegram import Bot

        bot = Bot(token=settings.telegram_bot_token)
        bot.send_message(
            chat_id=chat_id,
            text=f"AquaGuard report ready: {detection_id}",
        )
        return True
    except Exception:
        return False

