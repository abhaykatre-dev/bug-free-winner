"""
Sklearn quick model wrapper (color-histogram LogisticRegression).
Used as fallback when MobileNetV2 and ONNX models are unavailable.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

from PIL import Image

_QUICK_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "quick_model.joblib")


def predict_with_quick_model(pil: Image.Image) -> Optional[list[dict]]:
    """Returns top-3 [{disease, confidence}] or None if model not available."""
    model_path = str(Path(_QUICK_MODEL_PATH).resolve())
    if not os.path.exists(model_path):
        return None

    try:
        import joblib
        import numpy as np
        from ml.xai import image_feature_vector

        payload = joblib.load(model_path)
        model = payload["model"]
        bins = payload.get("bins", 64)

        fv = image_feature_vector(pil, bins=bins).reshape(1, -1)
        probs = model.predict_proba(fv)[0]
        classes = list(model.classes_)

        order = sorted(range(len(probs)), key=lambda i: probs[i], reverse=True)[:3]
        return [{"disease": classes[i], "confidence": float(probs[i])} for i in order]

    except Exception:
        return None
