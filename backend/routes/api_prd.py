"""
Primary API blueprint — implements FishAI_PRD.md endpoints at /api/*

Endpoints:
  POST   /api/diagnose              — Full AI diagnosis pipeline
  POST   /api/economic-estimate     — Standalone economic loss estimate
  GET    /api/pond-risk/<pond_id>   — Pond risk score
  POST   /api/ponds                 — Register/update a pond
  GET    /api/ponds/<pond_id>       — Get pond details
  GET    /api/outbreak-predict      — Outbreak risk for a geographic zone
  POST   /api/translate             — Text translation
  GET    /api/vets                  — Nearby vet locator
  POST   /api/diagnose/sync         — Batch sync offline queued diagnoses
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from io import BytesIO

import numpy as np
from flask import Blueprint, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from PIL import Image
from pydantic import BaseModel, Field

from db.sqlite import get_conn, init_db
from ml.gradcam import generate_gradcam_heatmap
from ml.runtime import run_inference
from services.auth import require_auth
from services.errors import ApiError
from services.settings import Settings
from services.translate import translate_text_from_settings
from data.disease_info import (
    disease_details,
    severity_from_confidence,
    trust_label,
    trust_message,
    urgency_from_disease,
)
from data.economic import calculate_economic_loss
from data.timeline import generate_action_timeline


api_bp = Blueprint("api_prd", __name__)
limiter = Limiter(key_func=get_remote_address, default_limits=["20 per minute"])


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _error(err: ApiError):
    return jsonify(err.to_dict()), err.http_status


def _decode_b64_image(b64: str) -> bytes:
    import base64
    try:
        return base64.b64decode(b64.encode("ascii"))
    except Exception:
        raise ValueError("invalid_base64")


@api_bp.before_app_request
def _ensure_db():
    init_db()


# --------------------------------------------------------------------------- #
#  POST /api/diagnose
# --------------------------------------------------------------------------- #
class DiagnoseRequest(BaseModel):
    image: str = Field(min_length=10, description="Base64 image (no data: prefix)")
    pond_id: str | None = None
    fish_count: int | None = Field(default=None, ge=0)
    avg_weight_kg: float | None = Field(default=None, ge=0)
    market_price_per_kg: float | None = Field(default=None, ge=0)
    species: str | None = None
    language: str = Field(default="en", min_length=2, max_length=8)
    lat: float | None = None
    lng: float | None = None


@api_bp.post("/diagnose")
@require_auth
def diagnose():
    """Full AI diagnosis pipeline — FishAI_PRD §12.1"""
    try:
        body = DiagnoseRequest.model_validate(request.get_json(force=True))
    except Exception:
        return _error(ApiError(
            code="INVALID_REQUEST",
            message="Invalid request body.",
            suggestion="Ensure all required fields match the API spec.",
            http_status=400,
        ))

    # Decode image
    try:
        img_bytes = _decode_b64_image(body.image)
    except ValueError:
        return _error(ApiError(
            code="INVALID_IMAGE",
            message="Image must be valid base64 bytes.",
            suggestion="Upload a JPEG/PNG/WebP file and base64-encode it (no data: prefix).",
            http_status=400,
        ))

    if len(img_bytes) > 10 * 1024 * 1024:
        return _error(ApiError(
            code="INVALID_IMAGE",
            message="Uploaded image exceeds 10MB limit.",
            suggestion="Compress the image before uploading.",
            http_status=400,
        ))

    try:
        pil = Image.open(BytesIO(img_bytes)).convert("RGB")
    except Exception:
        return _error(ApiError(
            code="INVALID_IMAGE",
            message="Uploaded file is not a valid image.",
            suggestion="Upload a JPEG, PNG, or WebP file under 10MB.",
            http_status=400,
        ))

    settings = Settings.from_env()

    # ---- Inference ----
    top_preds, model_type = run_inference(pil, settings)
    primary = top_preds[0]["disease"]
    confidence = float(top_preds[0]["confidence"])

    # ---- Severity / Trust ----
    severity = severity_from_confidence(confidence)
    t_label = trust_label(confidence)
    t_message = trust_message(confidence)

    # ---- Knowledge base lookup ----
    details = disease_details(primary)

    # ---- Grad-CAM heatmap ----
    mobilenet_path = settings.mobilenet_model_path or "models/mobilenet_fish.pt"
    labels_path = settings.mobilenet_labels_path or "models/mobilenet_labels.json"
    hm = generate_gradcam_heatmap(pil, mobilenet_path, labels_path)

    # ---- Progression (from details or default) ----
    progression = [
        {"day": 0, "stage": "Early", "symptoms": "Initial symptoms — mild visible signs", "mortality_pct": 5},
        {"day": 3, "stage": "Developing", "symptoms": "Spreading symptoms, appetite loss", "mortality_pct": 15},
        {"day": 7, "stage": "Advanced", "symptoms": "Severe symptoms, fish weakened", "mortality_pct": 40},
        {"day": 14, "stage": "Critical", "symptoms": "High mortality without intervention", "mortality_pct": 90},
    ]

    # ---- Similar cases from SQLite ----
    from ml.xai import image_feature_vector
    import base64
    fv = image_feature_vector(pil, bins=64)
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT case_id, disease, feature_vector_b64, outcome, image_path FROM case_vectors")
    rows = cur.fetchall()
    sims = []
    if rows:
        fv_norm = fv / (np.linalg.norm(fv) + 1e-8)
        for r in rows:
            vec = np.frombuffer(base64.b64decode(r["feature_vector_b64"]), dtype=np.float32)
            if vec.size != fv_norm.size:
                continue
            sim = float(np.dot(fv_norm, vec / (np.linalg.norm(vec) + 1e-8)))
            sims.append({
                "case_id": r["case_id"],
                "thumbnail_url": r["image_path"] or "",
                "disease": r["disease"],
                "similarity": round(max(0.0, min(1.0, sim)), 3),
                "outcome": r["outcome"] or "",
            })
        sims.sort(key=lambda x: x["similarity"], reverse=True)
        sims = sims[:3]

    # ---- Economic loss ----
    economic_loss = None
    if body.fish_count and body.fish_count > 0:
        economic_loss = calculate_economic_loss(
            disease=primary,
            fish_count=body.fish_count,
            market_price_per_kg=body.market_price_per_kg,
            avg_weight_kg=body.avg_weight_kg or 0.5,
            species=body.species,
        )

    # ---- Action timeline ----
    action_timeline = generate_action_timeline(
        disease=primary,
        severity=severity,
        pond_size_m2=None,
    )

    # ---- Translation ----
    reasoning = details.get("reasoning", "")
    translated = False
    if body.language and body.language != "en":
        reasoning = translate_text_from_settings(reasoning, body.language)
        translated = True

    diagnosis_id = f"dx_{datetime.now(timezone.utc).strftime('%Y%m%d')}_{uuid.uuid4().hex[:6]}"

    payload = {
        "diagnosis_id": diagnosis_id,
        "timestamp": _now_iso(),
        "top_predictions": [
            {
                "disease": p["disease"],
                "confidence": round(p["confidence"], 4),
                "severity": severity if i == 0 else None,
            }
            for i, p in enumerate(top_preds)
        ],
        "primary_disease": primary,
        "confidence": round(confidence, 4),
        "severity": severity,
        "trust_level": t_label,
        "trust_message": t_message,
        "heatmap_image_b64": hm.heatmap_b64_png,
        "bounding_box": hm.bounding_box,
        "reasoning": reasoning,
        "causes": details.get("causes", {}),
        "treatment": details.get("treatment", {}),
        "progression": progression,
        "similar_cases": sims,
        "economic_loss": economic_loss,
        "action_timeline": action_timeline,
        "translated": translated,
        "model_type": model_type,
    }

    # ---- Persist to SQLite ----
    cur.execute(
        """
        INSERT INTO diagnoses (
            diagnosis_id, timestamp, pond_id, user_id,
            primary_disease, confidence, severity,
            top_predictions_json, heatmap_image_b64, bbox_json,
            reasoning, causes_json, treatment_json, progression_json,
            similar_cases_json, economic_loss_json, action_timeline_json,
            language, lat, lng
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            diagnosis_id, payload["timestamp"], body.pond_id, None,
            primary, confidence, severity,
            json.dumps(payload["top_predictions"]),
            payload["heatmap_image_b64"],
            json.dumps(payload["bounding_box"]) if payload["bounding_box"] else None,
            reasoning,
            json.dumps(payload["causes"]),
            json.dumps(payload["treatment"]),
            json.dumps(payload["progression"]),
            json.dumps(payload["similar_cases"]),
            json.dumps(payload["economic_loss"]),
            json.dumps(payload["action_timeline"]),
            body.language, body.lat, body.lng,
        ),
    )
    conn.commit()

    # ---- Update pond risk score if pond_id given ----
    if body.pond_id:
        _update_pond_risk(cur, body.pond_id)
        conn.commit()

    conn.close()
    return jsonify(payload)


# --------------------------------------------------------------------------- #
#  POST /api/economic-estimate
# --------------------------------------------------------------------------- #
class EconomicEstimateRequest(BaseModel):
    disease: str
    severity: str
    fish_count: int = Field(ge=0)
    avg_weight_kg: float = Field(ge=0)
    market_price_per_kg: float | None = Field(default=None, ge=0)
    species: str | None = None


@api_bp.post("/economic-estimate")
@require_auth
def economic_estimate():
    """Standalone economic loss estimate — FishAI_PRD §12.3"""
    try:
        body = EconomicEstimateRequest.model_validate(request.get_json(force=True))
    except Exception:
        return _error(ApiError(
            code="INVALID_REQUEST",
            message="Missing or invalid required economic inputs.",
            suggestion="Provide disease, severity, fish_count, avg_weight_kg.",
            http_status=400,
        ))
    result = calculate_economic_loss(
        disease=body.disease,
        fish_count=body.fish_count,
        market_price_per_kg=body.market_price_per_kg,
        avg_weight_kg=body.avg_weight_kg,
        species=body.species,
    )
    return jsonify(result)


# --------------------------------------------------------------------------- #
#  GET /api/pond-risk/<pond_id>
# --------------------------------------------------------------------------- #
@api_bp.get("/pond-risk/<pond_id>")
@require_auth
def pond_risk(pond_id: str):
    """Pond risk score — FishAI_PRD §12.2"""
    conn = get_conn()
    cur = conn.cursor()
    # Last 7 days of diagnoses for this pond
    cur.execute(
        """
        SELECT primary_disease, timestamp, severity, confidence
        FROM diagnoses
        WHERE pond_id = ?
        ORDER BY timestamp DESC
        LIMIT 20
        """,
        (pond_id,),
    )
    rows = cur.fetchall()
    conn.close()

    sev_weights = {"Mild": 15, "Moderate": 50, "Critical": 90}
    if not rows:
        return jsonify({
            "pond_id": pond_id,
            "risk_score": 0,
            "risk_level": "Safe",
            "active_diseases": [],
            "diagnosis_count_last_7d": 0,
            "recommended_action": "No diagnoses recorded for this pond yet.",
        })

    risk_score = int(round(min(100, sum(sev_weights.get(r["severity"], 30) for r in rows) / len(rows))))
    risk_level = "Safe" if risk_score <= 30 else ("Warning" if risk_score <= 70 else "Critical")
    active_diseases = list({r["primary_disease"] for r in rows if r["primary_disease"] != "Healthy Fish"})[:5]
    actions = {
        "Safe": "Monitor and maintain water quality.",
        "Warning": "Treat immediately and test water quality parameters.",
        "Critical": "Isolate pond and consult expert immediately.",
    }
    return jsonify({
        "pond_id": pond_id,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "active_diseases": active_diseases,
        "diagnosis_count_last_7d": len(rows),
        "recommended_action": actions[risk_level],
    })


def _update_pond_risk(cur, pond_id: str) -> None:
    """Recalculate and persist pond risk score after a new diagnosis."""
    cur.execute(
        "SELECT severity FROM diagnoses WHERE pond_id = ? ORDER BY timestamp DESC LIMIT 10",
        (pond_id,),
    )
    rows = cur.fetchall()
    if not rows:
        return
    sev_weights = {"Mild": 15, "Moderate": 50, "Critical": 90}
    score = int(round(min(100, sum(sev_weights.get(r["severity"], 30) for r in rows) / len(rows))))
    level = "Safe" if score <= 30 else ("Warning" if score <= 70 else "Critical")
    cur.execute(
        """
        UPDATE ponds SET risk_score = ?, risk_level = ?, last_updated = ?
        WHERE pond_id = ?
        """,
        (score, level, _now_iso(), pond_id),
    )


# --------------------------------------------------------------------------- #
#  POST /api/ponds   (register/update)
#  GET  /api/ponds/<pond_id>
# --------------------------------------------------------------------------- #
class PondRequest(BaseModel):
    pond_id: str | None = None
    name: str = Field(min_length=1)
    species: str | None = None
    stock_count: int | None = Field(default=None, ge=0)
    lat: float | None = None
    lng: float | None = None
    area_hectares: float | None = None


@api_bp.post("/ponds")
@require_auth
def create_pond():
    """Register or update a pond — FishAI_PRD FR-07.1"""
    try:
        body = PondRequest.model_validate(request.get_json(force=True))
    except Exception:
        return _error(ApiError(
            code="INVALID_REQUEST",
            message="Invalid pond data.",
            suggestion="Provide at minimum: name.",
            http_status=400,
        ))
    pond_id = body.pond_id or f"pond_{uuid.uuid4().hex[:8]}"
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO ponds (pond_id, name, species, stock_count, lat, lng, created_at, risk_score, risk_level, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'Safe', ?)
        ON CONFLICT(pond_id) DO UPDATE SET
            name=excluded.name, species=excluded.species, stock_count=excluded.stock_count,
            lat=excluded.lat, lng=excluded.lng, last_updated=excluded.last_updated
        """,
        (pond_id, body.name, body.species, body.stock_count, body.lat, body.lng, _now_iso(), _now_iso()),
    )
    conn.commit()
    conn.close()
    return jsonify({"pond_id": pond_id, "message": "Pond registered successfully."})


@api_bp.get("/ponds/<pond_id>")
@require_auth
def get_pond(pond_id: str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM ponds WHERE pond_id = ?", (pond_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return _error(ApiError(code="POND_NOT_FOUND", message="Pond not found.", http_status=404))
    return jsonify(dict(row))


# --------------------------------------------------------------------------- #
#  GET /api/outbreak-predict?lat=&lng=&radius_km=
# --------------------------------------------------------------------------- #
def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    from math import asin, cos, radians, sin, sqrt
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * asin(sqrt(a))


@api_bp.get("/outbreak-predict")
@require_auth
def outbreak_predict():
    """Outbreak risk for geographic zone — FishAI_PRD §12.4"""
    try:
        lat = float(request.args.get("lat", "nan"))
        lng = float(request.args.get("lng", "nan"))
        radius_km = float(request.args.get("radius_km", "10"))
    except Exception:
        return _error(ApiError(
            code="INVALID_REQUEST",
            message="Invalid lat/lng/radius_km.",
            suggestion="Provide numeric query params: ?lat=&lng=&radius_km=",
            http_status=400,
        ))

    import math
    if not math.isfinite(lat) or not math.isfinite(lng):
        return _error(ApiError(
            code="INVALID_REQUEST",
            message="lat and lng are required.",
            suggestion="Provide ?lat=&lng= query params.",
            http_status=400,
        ))

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT primary_disease, lat, lng, severity, timestamp FROM diagnoses WHERE lat IS NOT NULL AND lng IS NOT NULL"
    )
    rows = cur.fetchall()
    conn.close()

    nearby = [r for r in rows if _haversine_km(lat, lng, float(r["lat"]), float(r["lng"])) <= radius_km]
    if not nearby:
        return jsonify({
            "zone": "Local Cluster",
            "outbreak_risk_score": 0,
            "outbreak_risk_level": "Low",
            "predicted_disease": None,
            "affected_ponds": 0,
            "forecast_window_days": 7,
            "alert_message": "No recent diagnoses in the selected radius.",
        })

    from collections import Counter
    disease_counts = Counter(r["primary_disease"] for r in nearby if r["primary_disease"] != "Healthy Fish")
    if not disease_counts:
        return jsonify({
            "zone": "Local Cluster",
            "outbreak_risk_score": 0,
            "outbreak_risk_level": "Low",
            "predicted_disease": None,
            "affected_ponds": len(nearby),
            "forecast_window_days": 7,
            "alert_message": "Nearby ponds appear healthy.",
        })

    disease, count = disease_counts.most_common(1)[0]
    # Weighted score: count relative to outbreak threshold (3 = threshold) × severity multiplier
    sev_counts = Counter(r["severity"] for r in nearby)
    sev_weight = (sev_counts.get("Critical", 0) * 1.5 + sev_counts.get("Moderate", 0) * 1.0 + sev_counts.get("Mild", 0) * 0.5)
    risk_score = min(99, int(round((count / 3.0) * 50 + (sev_weight / max(len(nearby), 1)) * 50)))
    risk_level = "Low" if risk_score < 40 else ("Warning" if risk_score < 70 else "High")

    msg_map = {
        "Low": f"Low outbreak risk. {count} nearby diagnoses of {disease}.",
        "Warning": f"Elevated outbreak risk: {count} ponds in cluster show {disease}. Preventive measures advised.",
        "High": f"High outbreak risk! {count} nearby diagnoses show {disease}. Take preventive measures immediately.",
    }
    return jsonify({
        "zone": "Local Cluster",
        "outbreak_risk_score": risk_score,
        "outbreak_risk_level": risk_level,
        "predicted_disease": disease,
        "affected_ponds": count,
        "forecast_window_days": 7,
        "alert_message": msg_map[risk_level],
    })


# --------------------------------------------------------------------------- #
#  POST /api/translate
# --------------------------------------------------------------------------- #
class TranslateRequest(BaseModel):
    text: str = Field(min_length=1)
    target_language: str = Field(min_length=2, max_length=8)


@api_bp.post("/translate")
@require_auth
def translate():
    """Translation endpoint — FishAI_PRD §12.5"""
    try:
        body = TranslateRequest.model_validate(request.get_json(force=True))
    except Exception:
        return _error(ApiError(code="INVALID_REQUEST", message="Provide text and target_language.", http_status=400))
    translated_text = translate_text_from_settings(body.text, body.target_language)
    return jsonify({
        "translated_text": translated_text,
        "source_language": "en",
        "target_language": body.target_language,
    })


# --------------------------------------------------------------------------- #
#  GET /api/vets?lat=&lng=&radius_km=
# --------------------------------------------------------------------------- #
@api_bp.get("/vets")
@require_auth
def vets():
    """Nearby vet locator — FishAI_PRD §12.6"""
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    radius_km = float(request.args.get("radius_km", "50"))
    center = None
    if lat and lng:
        try:
            center = (float(lat), float(lng))
        except Exception:
            center = None

    try:
        import json as _json
        with open("data/vets_seed.json", "r", encoding="utf-8") as f:
            all_vets = _json.load(f).get("vets", [])
    except Exception:
        all_vets = []

    result = []
    for v in all_vets:
        entry = dict(v)
        if center:
            d = _haversine_km(center[0], center[1], v["lat"], v["lng"])
            if d > radius_km:
                continue
            entry["distance_km"] = round(d, 1)
        result.append(entry)

    result.sort(key=lambda x: x.get("distance_km", 9999))
    return jsonify({"vets": result})


# --------------------------------------------------------------------------- #
#  POST /api/diagnose/sync  — offline batch sync
# --------------------------------------------------------------------------- #
@api_bp.post("/diagnose/sync")
@require_auth
def diagnose_sync():
    """
    Accept batch of offline-queued diagnoses from PWA Service Worker.
    FishAI_PRD FR-16 backend side.
    """
    data = request.get_json(force=True) or {}
    records = data.get("records", [])
    if not isinstance(records, list):
        return _error(ApiError(code="INVALID_REQUEST", message="records must be an array.", http_status=400))

    results = []
    settings = Settings.from_env()

    for rec in records[:50]:  # cap at 50 per batch
        local_id = rec.get("local_id", str(uuid.uuid4()))
        img_b64 = rec.get("image_b64", "")
        pond_id = rec.get("pond_id")
        fish_count = rec.get("fish_count")
        market_price = rec.get("market_price_per_kg")
        avg_weight = rec.get("avg_weight_kg", 0.5)
        language = rec.get("language", "en")

        try:
            img_bytes = _decode_b64_image(img_b64)
            pil = Image.open(BytesIO(img_bytes)).convert("RGB")
        except Exception:
            results.append({"local_id": local_id, "status": "error", "reason": "invalid_image"})
            continue

        top_preds, model_type = run_inference(pil, settings)
        primary = top_preds[0]["disease"]
        confidence = float(top_preds[0]["confidence"])
        severity = severity_from_confidence(confidence)
        details = disease_details(primary)

        mobilenet_path = settings.mobilenet_model_path or "models/mobilenet_fish.pt"
        labels_path = settings.mobilenet_labels_path or "models/mobilenet_labels.json"
        hm = generate_gradcam_heatmap(pil, mobilenet_path, labels_path)

        economic_loss = None
        if fish_count:
            economic_loss = calculate_economic_loss(
                disease=primary, fish_count=fish_count,
                market_price_per_kg=market_price, avg_weight_kg=avg_weight,
            )

        action_timeline = generate_action_timeline(disease=primary, severity=severity, pond_size_m2=None)
        diagnosis_id = f"dx_{datetime.now(timezone.utc).strftime('%Y%m%d')}_{uuid.uuid4().hex[:6]}"
        reasoning = details.get("reasoning", "")
        if language and language != "en":
            reasoning = translate_text_from_settings(reasoning, language)

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT OR IGNORE INTO diagnoses (
                diagnosis_id, timestamp, pond_id, user_id,
                primary_disease, confidence, severity,
                top_predictions_json, heatmap_image_b64, bbox_json,
                reasoning, causes_json, treatment_json, progression_json,
                similar_cases_json, economic_loss_json, action_timeline_json,
                language, lat, lng
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                diagnosis_id, _now_iso(), pond_id, None,
                primary, confidence, severity,
                json.dumps(top_preds[:3]), hm.heatmap_b64_png,
                json.dumps(hm.bounding_box) if hm.bounding_box else None,
                reasoning, json.dumps(details.get("causes", {})),
                json.dumps(details.get("treatment", {})), json.dumps([]),
                json.dumps([]), json.dumps(economic_loss),
                json.dumps(action_timeline), language, None, None,
            ),
        )
        conn.commit()
        conn.close()
        results.append({"local_id": local_id, "diagnosis_id": diagnosis_id, "status": "synced"})

    return jsonify({"synced": len([r for r in results if r["status"] == "synced"]), "results": results})


# --------------------------------------------------------------------------- #
#  POST /api/alert/sms
# --------------------------------------------------------------------------- #
@api_bp.post("/alert/sms")
@require_auth
def alert_sms():
    data = request.get_json(force=True) or {}
    phone = data.get("phone")
    message = data.get("message")
    
    if not phone or not message:
        return _error(ApiError(code="INVALID_REQUEST", message="Phone and message are required", http_status=400))
        
    from services.sms import send_sms_alert
    success = send_sms_alert(phone, message)
    
    if success:
        return jsonify({"success": True})
    else:
        return _error(ApiError(code="SMS_FAILED", message="Failed to send SMS via Fast2SMS", http_status=500))


# --------------------------------------------------------------------------- #
#  POST /api/alert/telegram
# --------------------------------------------------------------------------- #
@api_bp.post("/alert/telegram")
@require_auth
def alert_telegram():
    data = request.get_json(force=True) or {}
    chat_id = data.get("chat_id")
    message = data.get("message")
    
    if not chat_id or not message:
        return _error(ApiError(code="INVALID_REQUEST", message="Chat ID and message are required", http_status=400))
        
    from services.telegram import send_telegram_message
    from services.settings import Settings
    
    settings = Settings.from_env()
    success = send_telegram_message(chat_id, message, settings)
    
    if success:
        return jsonify({"success": True})
    else:
        return _error(ApiError(code="TELEGRAM_FAILED", message="Failed to send Telegram message", http_status=500))
