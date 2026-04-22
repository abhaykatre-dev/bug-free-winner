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
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
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
            language TEXT DEFAULT 'en',
            lat REAL,
            lng REAL,
            model_type TEXT DEFAULT 'unknown',
            synced_from_offline INTEGER DEFAULT 0
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS ponds (
            pond_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            species TEXT,
            stock_count INTEGER,
            lat REAL,
            lng REAL,
            area_hectares REAL,
            created_at TEXT,
            risk_score INTEGER DEFAULT 0,
            risk_level TEXT DEFAULT 'Safe',
            last_updated TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS case_vectors (
            case_id TEXT PRIMARY KEY,
            disease TEXT NOT NULL,
            feature_vector_b64 TEXT NOT NULL,
            outcome TEXT,
            image_path TEXT,
            verified INTEGER DEFAULT 0,
            source TEXT DEFAULT 'unknown'
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            telegram_chat_id TEXT,
            preferred_language TEXT DEFAULT 'en',
            lat REAL,
            lng REAL,
            created_at TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS outbreak_alerts (
            alert_id TEXT PRIMARY KEY,
            zone_geohash TEXT,
            disease TEXT,
            outbreak_risk_score INTEGER,
            created_at TEXT,
            notified INTEGER DEFAULT 0,
            resolved INTEGER DEFAULT 0
        );
    """)

    # Indexes for common query patterns
    cur.execute("CREATE INDEX IF NOT EXISTS idx_diagnoses_pond ON diagnoses(pond_id);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_diagnoses_timestamp ON diagnoses(timestamp);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_diagnoses_lat_lng ON diagnoses(lat, lng);")

    conn.commit()
    conn.close()


def b64_encode_bytes(b: bytes) -> str:
    return base64.b64encode(b).decode("ascii")


def b64_decode_bytes(s: str) -> bytes:
    return base64.b64decode(s.encode("ascii"))
