from __future__ import annotations

import logging
from functools import wraps
from typing import Callable, TypeVar

from flask import Blueprint, g, jsonify, request

from services.firebase_admin import get_firebase_auth
from services.settings import Settings

log = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__)
F = TypeVar("F", bound=Callable)


def require_auth(fn: F) -> F:
    @wraps(fn)
    def wrapper(*args, **kwargs):
        settings = Settings.from_env()
        if settings.auth_mode == "dev":
            g.user = {"uid": "dev", "role": "dev"}
            return fn(*args, **kwargs)

        token = _bearer_token(request.headers.get("Authorization") or "")
        if not token:
            return jsonify({"error": "Unauthorized"}), 401

        try:
            fb_auth = get_firebase_auth(settings.firebase_service_account_path)
            decoded = fb_auth.verify_id_token(token)
        except Exception as e:
            log.warning("auth_failed", extra={"error": str(e)})
            return jsonify({"error": "Unauthorized"}), 401

        g.user = {"uid": decoded.get("uid"), "claims": decoded}
        return fn(*args, **kwargs)

    return wrapper  # type: ignore[return-value]


@auth_bp.get("/whoami")
@require_auth
def whoami():
    return jsonify({"user": getattr(g, "user", None)})


def _bearer_token(header: str) -> str | None:
    h = header.strip()
    if not h:
        return None
    prefix = "bearer "
    if h.lower().startswith(prefix):
        return h[len(prefix) :].strip() or None
    return None

