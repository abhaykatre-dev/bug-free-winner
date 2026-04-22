from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    auth_mode: str
    firebase_service_account_path: str | None
    onnx_model_path: str | None
    telegram_bot_token: str | None
    libretranslate_url: str | None
    sqlite_path: str
    cors_origins: list[str]
    log_level: str

    @staticmethod
    def from_env() -> "Settings":
        auth_mode = (os.environ.get("AUTH_MODE") or "firebase").strip().lower()
        return Settings(
            auth_mode=auth_mode,
            firebase_service_account_path=_empty_to_none(
                os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH")
            ),
            onnx_model_path=_empty_to_none(os.environ.get("ONNX_MODEL_PATH")),
            telegram_bot_token=_empty_to_none(os.environ.get("TELEGRAM_BOT_TOKEN")),
            libretranslate_url=_empty_to_none(os.environ.get("LIBRETRANSLATE_URL")),
            sqlite_path=os.environ.get("SQLITE_PATH") or "./db/aquaguard.sqlite3",
            cors_origins=_split_csv(os.environ.get("CORS_ORIGINS") or ""),
            log_level=(os.environ.get("LOG_LEVEL") or "INFO").strip().upper(),
        )


def _split_csv(value: str) -> list[str]:
    items = [v.strip() for v in value.split(",")]
    return [v for v in items if v]


def _empty_to_none(value: str | None) -> str | None:
    if value is None:
        return None
    v = value.strip()
    return v if v else None

