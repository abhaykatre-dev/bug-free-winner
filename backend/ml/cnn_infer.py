from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from PIL import Image


MODEL_PATH = Path("models/cnn_fish_disease.pt")
LABELS_PATH = Path("models/cnn_fish_labels.json")


@lru_cache(maxsize=1)
def _load():
    if not MODEL_PATH.exists() or not LABELS_PATH.exists():
        return None

    import torch
    from torch import nn
    from torchvision import transforms

    payload = torch.load(MODEL_PATH, map_location="cpu")
    class_names = json.loads(LABELS_PATH.read_text(encoding="utf-8"))["class_names"]
    num_classes = int(payload["num_classes"])
    img_size = int(payload.get("img_size", 224))

    class SmallCNN(nn.Module):
        def __init__(self, num_classes: int):
            super().__init__()
            self.features = nn.Sequential(
                nn.Conv2d(3, 32, kernel_size=3, padding=1),
                nn.ReLU(),
                nn.MaxPool2d(2),
                nn.Conv2d(32, 64, kernel_size=3, padding=1),
                nn.ReLU(),
                nn.MaxPool2d(2),
                nn.Conv2d(64, 128, kernel_size=3, padding=1),
                nn.ReLU(),
                nn.MaxPool2d(2),
            )
            self.classifier = nn.Sequential(
                nn.Flatten(),
                nn.Linear(128 * 28 * 28, 256),
                nn.ReLU(),
                nn.Dropout(0.3),
                nn.Linear(256, num_classes),
            )

        def forward(self, x):
            return self.classifier(self.features(x))

    model = SmallCNN(num_classes=num_classes)
    model.load_state_dict(payload["state_dict"])
    model.eval()

    tfm = transforms.Compose(
        [
            transforms.Resize((img_size, img_size)),
            transforms.ToTensor(),
        ]
    )
    return model, class_names, tfm


def predict_top3(pil: Image.Image):
    loaded = _load()
    if loaded is None:
        return None

    import torch

    model, class_names, tfm = loaded
    x = tfm(pil).unsqueeze(0)
    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=1)[0].cpu().numpy()
    order = probs.argsort()[::-1][:3]
    return [
        {"disease": class_names[int(i)], "confidence": float(probs[int(i)])}
        for i in order
    ]

