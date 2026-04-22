from __future__ import annotations

import base64
import io
from dataclasses import dataclass

import cv2
import numpy as np
from PIL import Image


@dataclass(frozen=True)
class HeatmapResult:
    heatmap_b64_png: str
    bounding_box: dict[str, int] | None


def generate_saliency_heatmap_and_bbox(pil: Image.Image) -> HeatmapResult:
    """
    PRD calls for Grad-CAM + YOLO. This repo currently doesn't ship trained weights.
    This implementation produces a usable heatmap + bbox derived from image saliency
    so the API contract works end-to-end.
    """
    img = np.array(pil.convert("RGB"))
    bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    # Edge/texture saliency
    lap = cv2.Laplacian(gray, cv2.CV_32F, ksize=3)
    sal = np.abs(lap)
    sal = cv2.GaussianBlur(sal, (0, 0), sigmaX=3)
    sal = (sal - sal.min()) / (sal.max() - sal.min() + 1e-6)

    # Colormap heatmap (blue->yellow->red)
    hm_uint8 = np.uint8(255 * sal)
    hm_color = cv2.applyColorMap(hm_uint8, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(bgr, 0.6, hm_color, 0.4, 0)

    # Bounding box from thresholded saliency
    thresh = np.uint8((sal > 0.70).astype(np.uint8) * 255)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    cnts, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    bbox = None
    if cnts:
        c = max(cnts, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(c)
        if w * h > 0.01 * (img.shape[0] * img.shape[1]):  # ignore tiny noise
            bbox = {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}

    # Encode as PNG base64
    rgb_overlay = cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB)
    out = Image.fromarray(rgb_overlay)
    buf = io.BytesIO()
    out.save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return HeatmapResult(heatmap_b64_png=b64, bounding_box=bbox)


def image_feature_vector(pil: Image.Image, bins: int = 64) -> np.ndarray:
    """
    Simple, fast embedding: concatenated color histograms (R,G,B) + normalized.
    Produces 3*bins dims, suitable for cosine similarity with SQLite storage.
    """
    img = np.asarray(pil.convert("RGB"))
    vecs = []
    for ch in range(3):
        hist, _ = np.histogram(img[:, :, ch], bins=bins, range=(0, 255), density=False)
        vecs.append(hist.astype(np.float32))
    v = np.concatenate(vecs, axis=0)
    v = v / (np.linalg.norm(v) + 1e-8)
    return v

