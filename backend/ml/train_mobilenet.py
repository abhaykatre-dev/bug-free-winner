"""
MobileNetV2 fine-tune on the 7-class fish disease dataset.

Usage (run from backend/ directory):
    python3 -m ml.train_mobilenet \
        --train-dir "../Freshwater Fish Disease Aquaculture in south asia/Train" \
        --epochs 20 \
        --out models/mobilenet_fish.pt \
        --out-labels models/mobilenet_labels.json
"""
from __future__ import annotations

import argparse
import json
import os
import ssl
from pathlib import Path

# macOS Python 3.13 SSL fix
ssl._create_default_https_context = ssl._create_unverified_context

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, models, transforms
from sklearn.metrics import classification_report


def build_model(num_classes: int) -> nn.Module:
    weights = models.MobileNet_V2_Weights.IMAGENET1K_V1
    m = models.mobilenet_v2(weights=weights)
    # Freeze all base layers initially
    for p in m.features.parameters():
        p.requires_grad = False
    # Replace classifier
    in_features = m.classifier[1].in_features
    m.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(256, num_classes),
    )
    return m


def unfreeze_top_layers(model: nn.Module, n: int = 5) -> None:
    """Unfreeze the last n feature blocks for fine-tuning."""
    feature_blocks = list(model.features.children())
    for block in feature_blocks[-n:]:
        for p in block.parameters():
            p.requires_grad = True


def evaluate(model: nn.Module, loader: DataLoader, device: torch.device):
    model.eval()
    all_preds, all_labels = [], []
    with torch.no_grad():
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            preds = model(x).argmax(dim=1)
            all_preds.extend(preds.cpu().tolist())
            all_labels.extend(y.cpu().tolist())
    correct = sum(p == l for p, l in zip(all_preds, all_labels))
    return correct / len(all_labels), all_preds, all_labels


def main():
    parser = argparse.ArgumentParser(description="Fine-tune MobileNetV2 for fish disease classification.")
    parser.add_argument("--train-dir", default="../Freshwater Fish Disease Aquaculture in south asia/Train")
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr-head", type=float, default=1e-3, help="LR for head-only phase")
    parser.add_argument("--lr-finetune", type=float, default=1e-4, help="LR for fine-tuning phase")
    parser.add_argument("--finetune-epoch", type=int, default=10, help="Epoch to start unfreezing")
    parser.add_argument("--unfreeze-blocks", type=int, default=5)
    parser.add_argument("--img-size", type=int, default=224)
    parser.add_argument("--out", default="models/mobilenet_fish.pt")
    parser.add_argument("--out-labels", default="models/mobilenet_labels.json")
    parser.add_argument("--val-split", type=float, default=0.2)
    args = parser.parse_args()

    train_dir = Path(args.train_dir).resolve()
    out_path = Path(args.out).resolve()
    out_labels_path = Path(args.out_labels).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # --- Transforms ---
    train_tfm = transforms.Compose([
        transforms.Resize((args.img_size, args.img_size)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1, hue=0.05),
        transforms.RandomRotation(15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    val_tfm = transforms.Compose([
        transforms.Resize((args.img_size, args.img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    # --- Dataset ---
    full_ds = datasets.ImageFolder(str(train_dir), transform=train_tfm)
    class_names = full_ds.classes
    print(f"Classes ({len(class_names)}): {class_names}")
    print(f"Total samples: {len(full_ds)}")

    n_val = max(1, int(args.val_split * len(full_ds)))
    n_train = len(full_ds) - n_val
    train_ds, val_ds = random_split(full_ds, [n_train, n_val],
                                    generator=torch.Generator().manual_seed(42))
    val_ds.dataset = datasets.ImageFolder(str(train_dir), transform=val_tfm)

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=2, pin_memory=True)

    # --- Device ---
    if torch.backends.mps.is_available():
        device = torch.device("mps")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
    else:
        device = torch.device("cpu")
    print(f"Using device: {device}")

    # --- Model ---
    model = build_model(len(class_names)).to(device)
    loss_fn = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(
        filter(lambda p: p.requires_grad, model.parameters()), lr=args.lr_head
    )
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=3, factor=0.5)

    best_val_acc = 0.0
    best_state = None

    for epoch in range(1, args.epochs + 1):
        # Phase 2: unfreeze top layers at finetune_epoch
        if epoch == args.finetune_epoch:
            print(f"\n>>> Epoch {epoch}: Unfreezing top {args.unfreeze_blocks} feature blocks...")
            unfreeze_top_layers(model, args.unfreeze_blocks)
            optimizer = torch.optim.Adam(
                filter(lambda p: p.requires_grad, model.parameters()), lr=args.lr_finetune
            )
            scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=3, factor=0.5)

        # Train
        model.train()
        running_loss = 0.0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()
            logits = model(x)
            loss = loss_fn(logits, y)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

        avg_loss = running_loss / max(1, len(train_loader))
        val_acc, val_preds, val_labels = evaluate(model, val_loader, device)
        scheduler.step(1.0 - val_acc)

        print(f"Epoch {epoch:3d}/{args.epochs} | loss={avg_loss:.4f} | val_acc={val_acc:.4f}")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}
            print(f"  ✓ New best val_acc={best_val_acc:.4f} — checkpoint saved")

    # --- Save ---
    if best_state is not None:
        model.load_state_dict(best_state)

    torch.save({
        "state_dict": model.state_dict(),
        "class_names": class_names,
        "img_size": args.img_size,
        "architecture": "mobilenet_v2",
        "num_classes": len(class_names),
        "best_val_acc": best_val_acc,
    }, str(out_path))
    out_labels_path.write_text(json.dumps({"class_names": class_names}, indent=2), encoding="utf-8")

    print(f"\n=== Training complete ===")
    print(f"Best val_acc : {best_val_acc:.4f}")
    print(f"Model saved  : {out_path}")
    print(f"Labels saved : {out_labels_path}")
    print("\nValidation classification report:")
    print(classification_report(val_labels, val_preds, target_names=class_names, zero_division=0))


if __name__ == "__main__":
    main()
