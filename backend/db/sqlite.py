from __future__ import annotations

import base64
import os
import sqlite3
from pathlib import Path

from services.settings import Settings


def get_conn() -> sqlite3.Connection:
    settings = Settings.from_env()
    db_path = Path(settings.sqlite_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS diagnoses (
            diagnosis_id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            pond_id TEXT,
            user_id TEXT,
            primary_disease TEXT,
            confidence REAL,
            severity TEXT,
            top_predictions_json TEXT,
            heatmap_image_b64 TEXT,
            bbox_json TEXT,
            reasoning TEXT,
            causes_json TEXT,
            treatment_json TEXT,
            progression_json TEXT,
            similar_cases_json TEXT,
            economic_loss_json TEXT,
            action_timeline_json TEXT,
            language TEXT,
            lat REAL,
            lng REAL
        );
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS ponds (
            pond_id TEXT PRIMARY KEY,
            name TEXT,
            species TEXT,
            stock_count INTEGER,
            lat REAL,
            lng REAL,
            created_at TEXT,
            risk_score INTEGER,
            risk_level TEXT,
            last_updated TEXT
        );
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS case_vectors (
            case_id TEXT PRIMARY KEY,
            disease TEXT NOT NULL,
            feature_vector_b64 TEXT NOT NULL,
            outcome TEXT,
            image_path TEXT
        );
        """
    )
    conn.commit()
    conn.close()


def b64_encode_bytes(b: bytes) -> str:
    return base64.b64encode(b).decode("ascii")


def b64_decode_bytes(s: str) -> bytes:
    return base64.b64decode(s.encode("ascii"))

