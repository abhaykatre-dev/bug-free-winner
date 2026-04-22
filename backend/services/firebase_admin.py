from __future__ import annotations

import logging
from functools import lru_cache

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

log = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _init_app(service_account_path: str) -> firebase_admin.App:
    cred = credentials.Certificate(service_account_path)
    return firebase_admin.initialize_app(cred)


def get_firebase_auth(service_account_path: str | None):
    if not service_account_path:
        raise RuntimeError(
            "Firebase auth enabled but FIREBASE_SERVICE_ACCOUNT_PATH is not set"
        )
    _init_app(service_account_path)
    return firebase_auth

