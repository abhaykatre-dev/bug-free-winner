"""
Open-source translation service.

Priority chain:
  1. ArgosTranslate (fully offline, pip-installable, no API key)
  2. LibreTranslate HTTP API (self-hosted or public instance)
  3. Echo original text (graceful degradation)

Supported language codes (ISO 639-1):
  en, hi, mr, ta, te, bn, kn, or, ml
"""
from __future__ import annotations

import logging
import threading
from typing import Optional

log = logging.getLogger(__name__)

# Thread-safe flag so we only try to install language packs once
_argos_initialized = False
_argos_lock = threading.Lock()

# Language display names for error messages
SUPPORTED_LANGS = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
    "kn": "Kannada",
    "or": "Odia",
    "ml": "Malayalam",
}


# --------------------------------------------------------------------------- #
#  ArgosTranslate backend
# --------------------------------------------------------------------------- #
def _init_argos(target_lang: str) -> bool:
    """Download the en→target language pack if not already installed."""
    global _argos_initialized
    try:
        import argostranslate.package as ap
        import argostranslate.translate as at

        # Check if en→target already installed
        installed = at.get_installed_languages()
        installed_codes = {lang.code for lang in installed}
        if "en" in installed_codes and target_lang in installed_codes:
            return True

        # Update package index and install
        with _argos_lock:
            ap.update_package_index()
            available = ap.get_available_packages()
            to_install = [
                p for p in available
                if p.from_code == "en" and p.to_code == target_lang
            ]
            if not to_install:
                log.warning("argostranslate: no en→%s package available", target_lang)
                return False
            pkg = to_install[0]
            ap.install_from_path(pkg.download())
            log.info("argostranslate: installed en→%s package", target_lang)
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
    """
    Translate `text` from English to `target_lang`.
    Returns original text on failure (never raises).
    """
    if not text or not target_lang or target_lang == "en":
        return text

    # Normalise language code (e.g. "mr-IN" → "mr")
    lang_code = target_lang.split("-")[0].lower()

    # 1. Try ArgosTranslate (offline-first)
    result = _translate_argos(text, lang_code)
    if result:
        return result

    # 2. Try LibreTranslate if URL configured
    if libretranslate_url:
        result = _translate_libretranslate(text, lang_code, libretranslate_url)
        if result:
            return result

    # 3. Graceful fallback
    log.info("All translation backends failed for lang=%s; returning original", lang_code)
    return text


def translate_text_from_settings(text: str, target_lang: str) -> str:
    """Convenience wrapper that reads settings automatically."""
    from services.settings import Settings
    settings = Settings.from_env()
    return translate_text(text, target_lang, libretranslate_url=settings.libretranslate_url)
