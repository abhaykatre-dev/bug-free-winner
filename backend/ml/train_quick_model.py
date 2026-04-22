from __future__ import annotations

import argparse
import os
from pathlib import Path

import joblib
import numpy as np
from PIL import Image
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

from ml.xai import image_feature_vector


def load_dataset(train_dir: Path, bins: int):
    X = []
    y = []
    class_dirs = [d for d in train_dir.iterdir() if d.is_dir()]
    class_dirs.sort(key=lambda p: p.name.lower())

    for class_dir in class_dirs:
        label = class_dir.name
        for img_path in class_dir.iterdir():
            if not img_path.is_file():
                continue
            if img_path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue
            try:
                pil = Image.open(img_path).convert("RGB")
                fv = image_feature_vector(pil, bins=bins)
                X.append(fv)
                y.append(label)
            except Exception:
                # Skip unreadable images
                continue

    if not X:
        raise RuntimeError(f"No readable images found in {train_dir}")

    return np.array(X, dtype=np.float32), np.array(y)


def main():
    parser = argparse.ArgumentParser(description="Train a fast baseline fish disease classifier.")
    parser.add_argument(
        "--train-dir",
        default="../Freshwater Fish Disease Aquaculture in south asia/Train",
        help="Path to training class folders",
    )
    parser.add_argument(
        "--out",
        default="models/quick_model.joblib",
        help="Output model path",
    )
    parser.add_argument("--bins", type=int, default=64, help="Histogram bins per channel")
    args = parser.parse_args()

    train_dir = Path(args.train_dir).resolve()
    out_path = Path(args.out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    X, y = load_dataset(train_dir, bins=args.bins)
    classes = sorted(list(set(y.tolist())))

    # Keep split stratified when possible
    stratify = y if len(classes) > 1 else None
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=stratify
    )

    model = LogisticRegression(
        max_iter=600,
        multi_class="multinomial",
        solver="lbfgs",
        n_jobs=None,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_val)
    acc = accuracy_score(y_val, y_pred)
    print(f"Validation accuracy: {acc:.4f}")
    print(classification_report(y_val, y_pred, zero_division=0))

    joblib.dump(
        {"model": model, "classes": list(model.classes_), "bins": args.bins},
        out_path,
    )
    print(f"Saved quick model -> {out_path}")


if __name__ == "__main__":
    main()

