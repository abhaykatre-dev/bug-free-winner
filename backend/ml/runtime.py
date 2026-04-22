"""
Unified model runtime.
Priority chain:
  1. PyTorch MobileNetV2 (models/mobilenet_fish.pt + models/mobilenet_labels.json)
  2. ONNX Runtime (ONNX_MODEL_PATH env var)
  3. Sklearn quick model (models/quick_model.joblib)
  4. Deterministic placeholder (for dev/demo)
"""
from __future__ import annotations

import os
from pathlib import Path

import numpy as np

from services.settings import Settings


class ModelNotReadyError(RuntimeError):
    pass


DEFAULT_MOBILENET_PATH = "models/mobilenet_fish.pt"
DEFAULT_MOBILENET_LABELS = "models/mobilenet_labels.json"


def _predict_mobilenet(pil, model_path: str, labels_path: str) -> list[dict] | None:
    try:
        from ml.gradcam import predict_with_mobilenet
        return predict_with_mobilenet(pil, model_path, labels_path)
    except Exception:
        return None


def _predict_onnx(img_nhwc: np.ndarray, model_path: str, class_names: list[str]) -> list[dict] | None:
    try:
        import onnxruntime as ort
        sess = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
        input_name = sess.get_inputs()[0].name
        outputs = sess.run(None, {input_name: img_nhwc.astype(np.float32)})
        logits = np.array(outputs[0]).reshape(-1)
        # softmax
        ex = np.exp(logits - logits.max())
        probs = ex / (ex.sum() + 1e-9)
        order = np.argsort(probs)[::-1][:3]
        return [{"disease": class_names[int(i)], "confidence": float(probs[int(i)])} for i in order]
    except Exception:
        return None


def _predict_quick(pil) -> list[dict] | None:
    try:
        from ml.quick_model import predict_with_quick_model
        return predict_with_quick_model(pil)
    except Exception:
        return None


def _predict_placeholder(pil) -> list[dict]:
    """Deterministic placeholder based on image color histogram seed."""
    from ml.xai import image_feature_vector
    from data.disease_info import CLASSES
    fv = image_feature_vector(pil, bins=64)
    seed = int((fv[:10].sum() * 1e6) % (2**31 - 1))
    rng = np.random.default_rng(seed)
    scores = rng.random(len(CLASSES))
    scores = scores / (scores.sum() + 1e-9)
    order = np.argsort(scores)[::-1][:3]
    return [{"disease": CLASSES[int(i)], "confidence": float(scores[int(i)])} for i in order]


def run_inference(pil, settings: Settings | None = None) -> tuple[list[dict], str]:
    """
    Run inference on a PIL image.
    Returns (top3_predictions, model_type_used).
    top3_predictions: [{disease, confidence}, ...]
    """
    if settings is None:
        settings = Settings.from_env()

    # 1. PyTorch MobileNetV2
    mobilenet_path = settings.mobilenet_model_path or DEFAULT_MOBILENET_PATH
    labels_path = settings.mobilenet_labels_path or DEFAULT_MOBILENET_LABELS
    if os.path.exists(mobilenet_path):
        result = _predict_mobilenet(pil, mobilenet_path, labels_path)
        if result:
            return result, "mobilenet_v2"

    # 2. ONNX
    if settings.onnx_model_path and os.path.exists(settings.onnx_model_path):
        from data.disease_info import CLASSES
        from ml.preprocess import preprocess_pil_to_nhwc_float32
        img_arr = preprocess_pil_to_nhwc_float32(pil, size=224)
        result = _predict_onnx(img_arr, settings.onnx_model_path, CLASSES)
        if result:
            return result, "onnx"

    # 3. Sklearn quick model
    result = _predict_quick(pil)
    if result:
        return result, "sklearn"

    # 4. Placeholder
    return _predict_placeholder(pil), "placeholder"
