from __future__ import annotations

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field

from services.auth import require_auth
from services.translate import translate_text_from_settings

translate_bp = Blueprint("translate", __name__)


class TranslateRequest(BaseModel):
    text: str = Field(min_length=1)
    # Accept both snake_case (PRD spec) and camelCase (legacy)
    target_language: str | None = Field(default=None, min_length=2, max_length=8)
    targetLang: str | None = Field(default=None, min_length=2, max_length=8)


@translate_bp.post("/translate")
@require_auth
def translate():
    body = TranslateRequest.model_validate(request.get_json(force=True))
    lang = body.target_language or body.targetLang or "en"
    translated = translate_text_from_settings(body.text, lang)
    return jsonify({
        "translatedText": translated,
        "translated_text": translated,   # PRD field name
        "source_language": "en",
        "target_language": lang,
        "language": lang,
    })
