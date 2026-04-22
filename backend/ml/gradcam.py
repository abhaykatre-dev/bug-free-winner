"""
Real Grad-CAM implementation using PyTorch hooks.
Works with the MobileNetV2 model saved by ml/train_mobilenet.py.
"""
from __future__ import annotations

import base64
import io
import json
import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms


@dataclass(frozen=True)
class GradCAMResult:
    heatmap_b64_png: str
    bounding_box: Optional[dict]
    feature_importance: list[dict] = field(default_factory=list)


# --------------------------------------------------------------------------- #
#  Model loading (cached)
# --------------------------------------------------------------------------- #
_MODEL_CACHE: dict[str, tuple] = {}


def _load_mobilenet(model_path: str, labels_path: str) -> tuple:
    """Returns (model, class_names, device) — cached per path."""
    key = model_path
    if key in _MODEL_CACHE:
        return _MODEL_CACHE[key]

    checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)
    class_names = checkpoint.get("class_names", [])
    num_classes = checkpoint.get("num_classes", len(class_names))
    img_size = checkpoint.get("img_size", 224)

    # Rebuild architecture
    m = models.mobilenet_v2(weights=None)
    in_features = m.classifier[1].in_features
    m.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(256, num_classes),
    )
    m.load_state_dict(checkpoint["state_dict"])
    m.eval()

    # Try to load label file override
    if os.path.exists(labels_path):
        try:
            data = json.loads(Path(labels_path).read_text())
            class_names = data.get("class_names", class_names)
        except Exception:
            pass

    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    m = m.to(device)
    _MODEL_CACHE[key] = (m, class_names, img_size, device)
    return m, class_names, img_size, device


# --------------------------------------------------------------------------- #
#  Grad-CAM hook
# --------------------------------------------------------------------------- #
class _GradCAMHook:
    """Registers forward + backward hooks on target layer."""

    def __init__(self, layer: nn.Module):
        self.activations: Optional[torch.Tensor] = None
        self.gradients: Optional[torch.Tensor] = None
        self._fh = layer.register_forward_hook(self._save_activation)
        self._bh = layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, _module, _input, output):
        self.activations = output.detach()

    def _save_gradient(self, _module, _grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def remove(self):
        self._fh.remove()
        self._bh.remove()


def _compute_gradcam(
    model: nn.Module,
    img_tensor: torch.Tensor,
    class_idx: int,
    target_layer: nn.Module,
) -> np.ndarray:
    """Returns H×W heatmap in [0,1]."""
    hook = _GradCAMHook(target_layer)

    model.zero_grad()
    logits = model(img_tensor)
    score = logits[0, class_idx]
    score.backward()

    grads = hook.gradients  # (1, C, H, W)
    acts = hook.activations  # (1, C, H, W)
    hook.remove()

    if grads is None or acts is None:
        return np.zeros((7, 7), dtype=np.float32)

    weights = grads.mean(dim=(2, 3), keepdim=True)  # (1, C, 1, 1)
    cam = (weights * acts).sum(dim=1).squeeze(0)  # (H, W)
    cam = torch.relu(cam).cpu().numpy()
    if cam.max() > 0:
        cam = cam / cam.max()
    return cam.astype(np.float32)


# --------------------------------------------------------------------------- #
#  Public API
# --------------------------------------------------------------------------- #
def generate_gradcam_heatmap(
    pil: Image.Image,
    model_path: str,
    labels_path: str,
    class_idx: Optional[int] = None,
) -> GradCAMResult:
    """
    Generate a Grad-CAM heatmap overlay.
    If class_idx is None, uses the predicted (top-1) class.
    """
    try:
        model, class_names, img_size, device = _load_mobilenet(model_path, labels_path)
    except Exception:
        # Model not available — fall back to saliency
        return _saliency_fallback(pil)

    # Preprocess
    tfm = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    tensor = tfm(pil.convert("RGB")).unsqueeze(0).to(device)
    tensor.requires_grad_(True)

    # Get predicted class if not specified
    if class_idx is None:
        with torch.no_grad():
            logits = model(tensor)
        class_idx = int(logits.argmax(dim=1).item())

    # Target the last conv layer in MobileNetV2 features
    target_layer = model.features[-1]
    cam_low = _compute_gradcam(model, tensor, class_idx, target_layer)

    # Resize cam to original image size
    orig_w, orig_h = pil.size
    cam_up = cv2.resize(cam_low, (orig_w, orig_h), interpolation=cv2.INTER_CUBIC)
    cam_up = np.clip(cam_up, 0, 1)

    # Overlay on original image
    orig_bgr = cv2.cvtColor(np.array(pil.convert("RGB")), cv2.COLOR_RGB2BGR)
    heatmap_uint8 = np.uint8(255 * cam_up)
    heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(orig_bgr, 0.55, heatmap_color, 0.45, 0)

    # Bounding box from 70th-percentile threshold
    thresh_val = float(np.percentile(cam_up, 70))
    thresh_bin = np.uint8((cam_up >= thresh_val).astype(np.uint8) * 255)
    thresh_bin = cv2.morphologyEx(thresh_bin, cv2.MORPH_CLOSE, np.ones((11, 11), np.uint8))
    cnts, _ = cv2.findContours(thresh_bin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    bbox = None
    if cnts:
        largest = max(cnts, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)
        if w * h > 0.01 * orig_w * orig_h:
            bbox = {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}

    # Feature importance: top cam regions as descriptors
    feature_importance = _cam_region_descriptors(cam_up, class_names, class_idx)

    # Encode
    rgb_out = cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB)
    buf = io.BytesIO()
    Image.fromarray(rgb_out).save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")

    return GradCAMResult(
        heatmap_b64_png=b64,
        bounding_box=bbox,
        feature_importance=feature_importance,
    )


def _cam_region_descriptors(cam: np.ndarray, class_names: list[str], class_idx: int) -> list[dict]:
    """Convert top CAM activation zones into human-readable feature descriptors."""
    h, w = cam.shape
    regions = {
        "dorsal region": cam[:h // 3, :].mean(),
        "mid-body region": cam[h // 3: 2 * h // 3, :].mean(),
        "ventral region": cam[2 * h // 3:, :].mean(),
        "left flank": cam[:, :w // 2].mean(),
        "right flank": cam[:, w // 2:].mean(),
    }
    sorted_regions = sorted(regions.items(), key=lambda x: x[1], reverse=True)
    return [
        {"feature": region, "weight": round(float(weight), 3)}
        for region, weight in sorted_regions[:3]
        if weight > 0.1
    ]


def _saliency_fallback(pil: Image.Image) -> GradCAMResult:
    """Edge-saliency heatmap when no model is available."""
    img = np.array(pil.convert("RGB"))
    bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    lap = cv2.Laplacian(gray, cv2.CV_32F, ksize=3)
    sal = np.abs(lap)
    sal = cv2.GaussianBlur(sal, (0, 0), sigmaX=3)
    rng = sal.max() - sal.min()
    sal = (sal - sal.min()) / (rng + 1e-6)

    hm_uint8 = np.uint8(255 * sal)
    hm_color = cv2.applyColorMap(hm_uint8, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(bgr, 0.6, hm_color, 0.4, 0)

    thresh = np.uint8((sal > 0.70).astype(np.uint8) * 255)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    cnts, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    bbox = None
    if cnts:
        c = max(cnts, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(c)
        if w * h > 0.01 * (img.shape[0] * img.shape[1]):
            bbox = {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}

    rgb_out = cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB)
    buf = io.BytesIO()
    Image.fromarray(rgb_out).save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return GradCAMResult(heatmap_b64_png=b64, bounding_box=bbox, feature_importance=[])


def predict_with_mobilenet(pil: Image.Image, model_path: str, labels_path: str) -> Optional[list[dict]]:
    """Run full inference. Returns top-3 [{disease, confidence}] or None if model unavailable."""
    try:
        model, class_names, img_size, device = _load_mobilenet(model_path, labels_path)
    except Exception:
        return None

    tfm = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    tensor = tfm(pil.convert("RGB")).unsqueeze(0).to(device)
    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

    order = np.argsort(probs)[::-1]
    return [
        {"disease": class_names[int(i)], "confidence": float(probs[int(i)])}
        for i in order[:3]
    ]
