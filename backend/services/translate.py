from __future__ import annotations

import os

import httpx

from services.settings import Settings


def translate_text(text: str, target_lang: str) -> str:
    settings = Settings.from_env()
    url = settings.libretranslate_url
    if not url:
        return text

    try:
        r = httpx.post(
            f"{url.rstrip('/')}/translate",
            json={"q": text, "source": "en", "target": target_lang, "format": "text"},
            timeout=10.0,
        )
        r.raise_for_status()
        data = r.json()
        return data.get("translatedText") or text
    except Exception:
        return text

