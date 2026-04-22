from __future__ import annotations

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth
from services.telegram import send_telegram_report

telegram_bp = Blueprint("telegram", __name__)


class TelegramSendRequest(BaseModel):
    chatId: str = Field(min_length=1)
    detectionId: str = Field(min_length=1)


@telegram_bp.post("/telegram/send-report")
@require_auth
def telegram_send_report():
    body = TelegramSendRequest.model_validate(request.get_json(force=True))
    ok = send_telegram_report(chat_id=body.chatId, detection_id=body.detectionId)
    return jsonify({"ok": ok})

