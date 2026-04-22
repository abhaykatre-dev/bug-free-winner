from __future__ import annotations

import io

import httpx
import numpy as np
from PIL import Image


def load_image_from_url(url: str) -> Image.Image:
    r = httpx.get(url, timeout=15.0)
    r.raise_for_status()
    img = Image.open(io.BytesIO(r.content)).convert("RGB")
    return img


def preprocess_pil_to_nhwc_float32(img: Image.Image, size: int = 224) -> np.ndarray:
    resized = img.resize((size, size))
    arr = np.asarray(resized).astype(np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0)  # NHWC
    return arr

