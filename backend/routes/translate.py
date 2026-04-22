from __future__ import annotations

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth
from services.translate import translate_text

translate_bp = Blueprint("translate", __name__)


class TranslateRequest(BaseModel):
    text: str = Field(min_length=1)
    targetLang: str = Field(min_length=2, max_length=8)


@translate_bp.post("/translate")
@require_auth
def translate():
    body = TranslateRequest.model_validate(request.get_json(force=True))
    translated = translate_text(body.text, body.targetLang)
    return jsonify({"translatedText": translated, "language": body.targetLang})

