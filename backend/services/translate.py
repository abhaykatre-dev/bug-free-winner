"""
Open-source translation service.

Priority chain:
  1. ArgosTranslate (fully offline, pip-installable, no API key)
  2. MyMemory free API (no key needed, 1000 words/day free)
  3. LibreTranslate HTTP API (self-hosted, skip if same port as Flask)
  4. Echo original text (graceful degradation)
"""
from __future__ import annotations

import logging
import threading
from typing import Optional

log = logging.getLogger(__name__)

_argos_initialized = False
_argos_lock = threading.Lock()

SUPPORTED_LANGS = {
    "en": "English", "hi": "Hindi", "mr": "Marathi",
    "ta": "Tamil", "te": "Telugu", "bn": "Bengali",
    "kn": "Kannada", "or": "Odia", "ml": "Malayalam",
}


# --------------------------------------------------------------------------- #
#  ArgosTranslate backend
# --------------------------------------------------------------------------- #
def _init_argos(target_lang: str) -> bool:
    global _argos_initialized
    try:
        import argostranslate.package as ap
        import argostranslate.translate as at
        installed = at.get_installed_languages()
        installed_codes = {lang.code for lang in installed}
        if "en" in installed_codes and target_lang in installed_codes:
            return True
        with _argos_lock:
            ap.update_package_index()
            available = ap.get_available_packages()
            to_install = [p for p in available if p.from_code == "en" and p.to_code == target_lang]
            if not to_install:
                return False
            pkg = to_install[0]
            ap.install_from_path(pkg.download())
            return True
    except ImportError:
        return False
    except Exception as e:
        log.warning("argostranslate init failed: %s", e)
        return False


def _translate_argos(text: str, target_lang: str) -> Optional[str]:
    if target_lang == "en":
        return text
    try:
        import argostranslate.translate as at
        if not _init_argos(target_lang):
            return None
        installed = at.get_installed_languages()
        src = next((l for l in installed if l.code == "en"), None)
        tgt = next((l for l in installed if l.code == target_lang), None)
        if src is None or tgt is None:
            return None
        translation = src.get_translation(tgt)
        if translation is None:
            return None
        return translation.translate(text)
    except ImportError:
        return None
    except Exception as e:
        log.warning("argostranslate translate failed: %s", e)
        return None


# --------------------------------------------------------------------------- #
#  MyMemory Free API (no key needed, works immediately)
# --------------------------------------------------------------------------- #
def _translate_mymemory(text: str, target_lang: str) -> Optional[str]:
    """Free MyMemory translation API — 1000 words/day without key."""
    try:
        import httpx
        r = httpx.get(
            "https://api.mymemory.translated.net/get",
            params={"q": text[:500], "langpair": f"en|{target_lang}"},
            timeout=8.0,
        )
        r.raise_for_status()
        data = r.json()
        translated = data.get("responseData", {}).get("translatedText", "")
        if translated and translated.lower() != text.lower() and "INVALID" not in translated.upper():
            return translated
        return None
    except Exception as e:
        log.warning("mymemory translate failed: %s", e)
        return None


# --------------------------------------------------------------------------- #
#  LibreTranslate backend
# --------------------------------------------------------------------------- #
def _translate_libretranslate(text: str, target_lang: str, url: str) -> Optional[str]:
    try:
        import httpx
        r = httpx.post(
            f"{url.rstrip('/')}/translate",
            json={"q": text, "source": "en", "target": target_lang, "format": "text"},
            timeout=10.0,
        )
        r.raise_for_status()
        return r.json().get("translatedText") or None
    except Exception as e:
        log.warning("libretranslate failed: %s", e)
        return None


# --------------------------------------------------------------------------- #
#  Public API
# --------------------------------------------------------------------------- #
def translate_text(text: str, target_lang: str, libretranslate_url: Optional[str] = None) -> str:
    if not text or not target_lang or target_lang == "en":
        return text

    lang_code = target_lang.split("-")[0].lower()

    # 1. ArgosTranslate (offline-first)
    result = _translate_argos(text, lang_code)
    if result:
        return result

    # 2. MyMemory free API (reliable cloud, no setup required)
    result = _translate_mymemory(text, lang_code)
    if result:
        return result

    # 3. LibreTranslate — skip if same port as Flask (5001)
    if libretranslate_url and ":5001" not in libretranslate_url:
        result = _translate_libretranslate(text, lang_code, libretranslate_url)
        if result:
            return result

    log.info("All translation backends failed for lang=%s; returning original", lang_code)
    return text


def translate_text_from_settings(text: str, target_lang: str) -> str:
    """Convenience wrapper that reads settings automatically."""
    from services.settings import Settings
    settings = Settings.from_env()
    return translate_text(text, target_lang, libretranslate_url=settings.libretranslate_url)
