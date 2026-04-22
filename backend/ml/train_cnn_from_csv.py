from __future__ import annotations

import argparse
import csv
import json
from dataclasses import dataclass
from pathlib import Path

from PIL import Image
import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import transforms


@dataclass
class Sample:
    image_path: Path
    label_idx: int


class CsvImageDataset(Dataset):
    def __init__(self, samples: list[Sample], transform):
        self.samples = samples
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        s = self.samples[idx]
        img = Image.open(s.image_path).convert("RGB")
        x = self.transform(img)
        y = torch.tensor(s.label_idx, dtype=torch.long)
        return x, y


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
        x = self.features(x)
        return self.classifier(x)


def parse_csv(csv_path: Path, dataset_root: Path):
    rows = []
    labels = set()
    with csv_path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            label = r["Folder Name"].strip()
            filename = r["Image Filename"].strip()
            image_path = dataset_root / "Train" / label / filename
            if image_path.exists():
                rows.append((image_path, label))
                labels.add(label)
    class_names = sorted(labels)
    class_to_idx = {c: i for i, c in enumerate(class_names)}
    samples = [Sample(image_path=p, label_idx=class_to_idx[l]) for p, l in rows]
    return samples, class_names


def evaluate(model, loader, device):
    model.eval()
    total = 0
    correct = 0
    with torch.no_grad():
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            logits = model(x)
            pred = logits.argmax(dim=1)
            correct += (pred == y).sum().item()
            total += y.size(0)
    return (correct / total) if total else 0.0


def main():
    p = argparse.ArgumentParser()
    p.add_argument(
        "--csv",
        default="../Freshwater Fish Disease Aquaculture in south asia/Train.csv",
        help="Path to training CSV",
    )
    p.add_argument(
        "--dataset-root",
        default="../Freshwater Fish Disease Aquaculture in south asia",
        help="Dataset root containing Train/",
    )
    p.add_argument("--epochs", type=int, default=5)
    p.add_argument("--batch-size", type=int, default=32)
    p.add_argument("--lr", type=float, default=1e-3)
    p.add_argument("--img-size", type=int, default=224)
    p.add_argument("--out-model", default="models/cnn_fish_disease.pt")
    p.add_argument("--out-labels", default="models/cnn_fish_labels.json")
    args = p.parse_args()

    csv_path = Path(args.csv).resolve()
    root = Path(args.dataset_root).resolve()
    out_model = Path(args.out_model).resolve()
    out_labels = Path(args.out_labels).resolve()
    out_model.parent.mkdir(parents=True, exist_ok=True)

    samples, class_names = parse_csv(csv_path, root)
    if not samples:
        raise RuntimeError("No samples found from CSV + image folder.")

    tfm = transforms.Compose(
        [
            transforms.Resize((args.img_size, args.img_size)),
            transforms.RandomHorizontalFlip(),
            transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.1),
            transforms.ToTensor(),
        ]
    )
    ds = CsvImageDataset(samples, tfm)
    n_val = max(1, int(0.2 * len(ds)))
    n_train = len(ds) - n_val
    train_ds, val_ds = random_split(ds, [n_train, n_val], generator=torch.Generator().manual_seed(42))

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=0)

    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    model = SmallCNN(num_classes=len(class_names)).to(device)
    opt = torch.optim.Adam(model.parameters(), lr=args.lr)
    loss_fn = nn.CrossEntropyLoss()

    for epoch in range(1, args.epochs + 1):
        model.train()
        running = 0.0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            opt.zero_grad()
            logits = model(x)
            loss = loss_fn(logits, y)
            loss.backward()
            opt.step()
            running += loss.item()

        train_acc = evaluate(model, train_loader, device)
        val_acc = evaluate(model, val_loader, device)
        print(
            f"Epoch {epoch}/{args.epochs} - loss={running/max(1,len(train_loader)):.4f} "
            f"train_acc={train_acc:.4f} val_acc={val_acc:.4f}"
        )

    torch.save(
        {
            "state_dict": model.state_dict(),
            "num_classes": len(class_names),
            "img_size": args.img_size,
        },
        out_model,
    )
    out_labels.write_text(json.dumps({"class_names": class_names}, indent=2), encoding="utf-8")
    print(f"Saved model: {out_model}")
    print(f"Saved labels: {out_labels}")


if __name__ == "__main__":
    main()

