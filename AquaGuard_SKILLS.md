# 🛠️ Frontend Skills & Developer Reference
## AquaGuard XAI — React + Flask + Firebase
**Version:** 1.0 | April 2025

---

## 1. PROJECT STRUCTURE

```
aquaguard-xai/
│
├── frontend/                          # React (Vite) PWA
│   ├── public/
│   │   ├── manifest.json              # PWA manifest
│   │   ├── sw.js                      # Service worker (offline)
│   │   └── model/
│   │       └── model_int8.onnx        # Bundled ONNX model (offline)
│   │
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── firebase.ts
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Scan.tsx
│   │   │   ├── Report.tsx             # XAI Report Card
│   │   │   ├── Economic.tsx           # Economic Loss Predictor
│   │   │   ├── Timeline.tsx           # Action Timeline
│   │   │   ├── Progression.tsx        # Disease Stage Simulator
│   │   │   ├── Similarity.tsx         # Similar Cases Browser
│   │   │   ├── Dashboard.tsx          # Pond Risk Dashboard
│   │   │   ├── VetLocator.tsx         # Leaflet.js map
│   │   │   ├── VoiceBot.tsx           # Voice chatbot
│   │   │   ├── Settings.tsx
│   │   │   └── Admin.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── PhoneOTPForm.tsx
│   │   │   │   ├── GoogleSignIn.tsx
│   │   │   │   └── LanguagePicker.tsx
│   │   │   ├── scan/
│   │   │   │   ├── CameraCapture.tsx
│   │   │   │   ├── ImageUpload.tsx
│   │   │   │   └── DetectionLoader.tsx
│   │   │   ├── report/
│   │   │   │   ├── UrgencyBanner.tsx
│   │   │   │   ├── HeatmapOverlay.tsx
│   │   │   │   ├── TrustMeter.tsx
│   │   │   │   ├── ConfidenceGauge.tsx
│   │   │   │   ├── ClassBreakdown.tsx
│   │   │   │   ├── TreatmentGuide.tsx
│   │   │   │   └── ReportTabs.tsx
│   │   │   ├── economic/
│   │   │   │   ├── LossCalculator.tsx
│   │   │   │   └── LossChart.tsx
│   │   │   ├── timeline/
│   │   │   │   ├── DayCard.tsx
│   │   │   │   └── TimelineRail.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── PondCard.tsx
│   │   │   │   ├── RiskBadge.tsx
│   │   │   │   └── OutbreakAlert.tsx
│   │   │   └── shared/
│   │   │       ├── Navbar.tsx
│   │   │       ├── BottomNav.tsx
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── OfflineBanner.tsx
│   │   │       ├── VoiceFAB.tsx
│   │   │       └── LanguageSwitcher.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useCamera.ts
│   │   │   ├── useDetection.ts
│   │   │   ├── useOfflineModel.ts     # ONNX web inference
│   │   │   ├── useVoice.ts            # Web Speech API
│   │   │   ├── usePonds.ts
│   │   │   └── useTranslation.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts                 # Flask API client
│   │   │   ├── firestore.ts
│   │   │   ├── storage.ts
│   │   │   ├── telegram.ts
│   │   │   └── sync.ts                # Offline queue sync
│   │   │
│   │   ├── store/
│   │   │   └── useAppStore.ts         # Zustand global state
│   │   │
│   │   ├── utils/
│   │   │   ├── imageUtils.ts
│   │   │   ├── diseaseData.ts         # All 7 disease info
│   │   │   ├── economicCalc.ts        # Loss formula
│   │   │   └── urgencyMap.ts
│   │   │
│   │   ├── types/
│   │   │   ├── Detection.ts
│   │   │   ├── User.ts
│   │   │   ├── Pond.ts
│   │   │   └── Report.ts
│   │   │
│   │   └── i18n/
│   │       ├── en.json
│   │       ├── hi.json
│   │       ├── te.json
│   │       ├── bn.json
│   │       └── or.json
│   │
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                           # Python Flask
│   ├── app.py                         # Flask entry point
│   ├── routes/
│   │   ├── detect.py
│   │   ├── explain.py                 # Grad-CAM
│   │   ├── economic.py
│   │   ├── timeline.py
│   │   ├── risk.py
│   │   ├── outbreak.py
│   │   ├── similarity.py
│   │   └── translate.py
│   ├── ml/
│   │   ├── model.py                   # MobileNetV2 loader
│   │   ├── gradcam.py                 # Grad-CAM engine
│   │   ├── preprocessor.py
│   │   └── embeddings.py              # Similarity index
│   ├── services/
│   │   ├── firebase_auth.py           # Token validation
│   │   ├── telegram_bot.py
│   │   └── firestore_client.py
│   ├── data/
│   │   ├── disease_info.py            # Disease → treatment map
│   │   ├── economic_factors.py        # Mortality rate table
│   │   └── timeline_templates.py     # Day-wise plan templates
│   ├── models/
│   │   ├── mobilenetv2_fish.h5
│   │   └── model.onnx
│   ├── requirements.txt
│   └── Dockerfile
│
└── ml_training/                       # Jupyter notebooks
    ├── 01_eda.ipynb
    ├── 02_preprocessing.ipynb
    ├── 03_training.ipynb
    ├── 04_evaluation.ipynb
    ├── 05_gradcam_test.ipynb
    └── 06_export_onnx.ipynb
```

---

## 2. FIREBASE SETUP

```typescript
// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const config = {
  apiKey:            import.meta.env.VITE_FB_API_KEY,
  authDomain:        import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FB_APP_ID,
};

const app = initializeApp(config);
export const auth      = getAuth(app);
export const db        = getFirestore(app);
export const storage   = getStorage(app);
export const messaging = getMessaging(app);
```

---

## 3. AUTH HOOK

```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export interface AppUser extends User {
  role: "farmer" | "expert" | "admin";
  region: string;
  language: string;
  telegramChatId?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const ref = doc(db, "users", fbUser.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            name: fbUser.displayName ?? "",
            phone: fbUser.phoneNumber ?? "",
            email: fbUser.email ?? "",
            role: "farmer",
            region: "",
            language: "en",
            ponds: [],
            createdAt: serverTimestamp(),
          });
        }
        const data = snap.data() ?? {};
        setUser({ ...fbUser, role: data.role ?? "farmer", region: data.region ?? "", language: data.language ?? "en" });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  return { user, loading };
}
```

---

## 4. DETECTION API SERVICE

```typescript
// src/services/api.ts
import { auth } from "../firebase";

const API = import.meta.env.VITE_FLASK_API_URL;  // e.g. https://api.aquaguard.in/api/v1

async function authHeaders() {
  const token = await auth.currentUser?.getIdToken();
  return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
}

export interface DetectionPayload {
  imageUrl: string;
  pondId: string;
  fishCount?: number;
  marketPricePerKg?: number;
  avgWeightKg?: number;
}

export interface DetectionResult {
  detectionId: string;
  disease: string;
  confidence: number;
  severity: "Mild" | "Moderate" | "High" | "Critical";
  urgency: "healthy" | "monitor" | "treat" | "isolate";
  category: string;
  heatmapUrl: string;
  reasoning: string;
  top3: { label: string; confidence: number }[];
  economicLoss?: {
    estimatedLossToday: number;
    lossIfDelayed3Days: number;
    lossIfDelayed7Days: number;
    mortalityRate: number;
  };
  similarCases: { caseId: string; similarity: number; disease: string; imageUrl: string }[];
}

export async function detectDisease(payload: DetectionPayload): Promise<DetectionResult> {
  const res = await fetch(`${API}/detect`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Detection failed: ${res.status}`);
  return res.json();
}

export async function getActionTimeline(disease: string, severity: string, fishCount: number, pondSizeM2: number) {
  const res = await fetch(`${API}/action-timeline`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ disease, severity, fishCount, pondSizeM2 }),
  });
  return res.json();
}

export async function getPondRisk(pondId: string) {
  const res = await fetch(`${API}/pond-risk/${pondId}`, {
    headers: await authHeaders(),
  });
  return res.json();
}

export async function sendTelegramReport(chatId: string, detectionId: string) {
  const res = await fetch(`${API}/telegram/send-report`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ chatId, detectionId }),
  });
  return res.json();
}

export async function translateText(text: string, targetLang: string) {
  const res = await fetch(`${API}/translate`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ text, targetLang }),
  });
  return res.json();
}
```

---

## 5. OFFLINE ONNX INFERENCE HOOK

```typescript
// src/hooks/useOfflineModel.ts
import { useEffect, useRef, useState } from "react";
import * as ort from "onnxruntime-web";

const CLASSES = [
  "Bacterial Red Disease",
  "Bacterial diseases - Aeromoniasis",
  "Bacterial Gill Disease",
  "Fungal diseases Saprolegniasis",
  "Healthy Fish",
  "Parasitic Diseases",
  "Viral diseases White tail disease",
];

export function useOfflineModel() {
  const sessionRef = useRef<ort.InferenceSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ort.InferenceSession.create("/model/model_int8.onnx")
      .then((s) => { sessionRef.current = s; setReady(true); })
      .catch(console.error);
  }, []);

  const runInference = async (imageData: ImageData) => {
    if (!sessionRef.current) throw new Error("Model not loaded");
    // Preprocess: normalize to [0,1], shape [1,224,224,3]
    const float32 = new Float32Array(1 * 224 * 224 * 3);
    for (let i = 0; i < imageData.data.length / 4; i++) {
      float32[i * 3 + 0] = imageData.data[i * 4 + 0] / 255;
      float32[i * 3 + 1] = imageData.data[i * 4 + 1] / 255;
      float32[i * 3 + 2] = imageData.data[i * 4 + 2] / 255;
    }
    const tensor = new ort.Tensor("float32", float32, [1, 224, 224, 3]);
    const output = await sessionRef.current.run({ input: tensor });
    const probs = Array.from(output.output.data as Float32Array);
    const topIdx = probs.indexOf(Math.max(...probs));
    return { disease: CLASSES[topIdx], confidence: probs[topIdx], top3: getTop3(probs) };
  };

  function getTop3(probs: number[]) {
    return probs
      .map((p, i) => ({ label: CLASSES[i], confidence: p }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  return { ready, runInference };
}
```

---

## 6. VOICE HOOK (Web Speech API)

```typescript
// src/hooks/useVoice.ts
import { useCallback, useRef } from "react";

const LANG_MAP: Record<string, string> = {
  en: "en-IN", hi: "hi-IN", te: "te-IN", bn: "bn-IN", or: "or-IN",
};

export function useVoice(language = "en") {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback((onCommand: (cmd: string) => void) => {
    const SR = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = LANG_MAP[language] ?? "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => onCommand(e.results[0][0].transcript.toLowerCase().trim());
    rec.start();
    recognitionRef.current = rec;
  }, [language]);

  const speak = useCallback((text: string) => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = LANG_MAP[language] ?? "en-IN";
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
  }, [language]);

  const stop = useCallback(() => recognitionRef.current?.stop(), []);

  return { startListening, speak, stop };
}

// Voice command handler
export function handleVoiceCommand(command: string, navigate: Function, actions: Record<string, () => void>) {
  if (command.includes("start scan") || command.includes("scan")) actions.scan?.();
  else if (command.includes("read report") || command.includes("report")) actions.readReport?.();
  else if (command.includes("nearest vet") || command.includes("vet")) navigate("/vet-locator");
  else if (command.includes("treatment") || command.includes("timeline")) actions.openTimeline?.();
  else if (command.includes("telegram")) actions.sendTelegram?.();
  else if (command.includes("dashboard")) navigate("/dashboard");
  else if (command.includes("hindi") || command.includes("हिंदी")) actions.setLang?.("hi");
  else if (command.includes("telugu") || command.includes("తెలుగు")) actions.setLang?.("te");
}
```

---

## 7. ECONOMIC LOSS CALCULATOR

```typescript
// src/utils/economicCalc.ts

// Mortality rates by disease + delay (from literature)
const MORTALITY_RATES: Record<string, { day0: number; day3: number; day7: number; day14: number }> = {
  "Healthy Fish":                           { day0: 0,    day3: 0,    day7: 0,    day14: 0    },
  "Bacterial Red Disease":                  { day0: 0.10, day3: 0.30, day7: 0.55, day14: 0.75 },
  "Bacterial Gill Disease":                 { day0: 0.15, day3: 0.35, day7: 0.60, day14: 0.80 },
  "Bacterial diseases - Aeromoniasis":      { day0: 0.20, day3: 0.45, day7: 0.70, day14: 0.90 },
  "Fungal diseases Saprolegniasis":         { day0: 0.05, day3: 0.15, day7: 0.30, day14: 0.50 },
  "Parasitic Diseases":                     { day0: 0.10, day3: 0.25, day7: 0.45, day14: 0.65 },
  "Viral diseases White tail disease":      { day0: 0.30, day3: 0.60, day7: 0.85, day14: 0.95 },
};

export interface EconomicInput {
  disease: string;
  fishCount: number;
  marketPricePerKg: number;
  avgWeightKg: number;
}

export interface EconomicResult {
  treatmentCost: number;
  lossIfTreatedToday: number;
  lossIfDelayed3Days: number;
  lossIfDelayed7Days: number;
  lossIfDelayed14Days: number;
  mortalityRate3Days: number;
  projectedDeaths3Days: number;
}

export function calculateEconomicLoss(input: EconomicInput): EconomicResult {
  const { disease, fishCount, marketPricePerKg, avgWeightKg } = input;
  const rates = MORTALITY_RATES[disease] ?? MORTALITY_RATES["Bacterial Red Disease"];
  const valuePerFish = avgWeightKg * marketPricePerKg;

  const calc = (rate: number) => Math.round(fishCount * rate * valuePerFish);

  return {
    treatmentCost:          Math.round(fishCount * 0.024),   // ~₹24 treatment per 1000 fish
    lossIfTreatedToday:     calc(rates.day0),
    lossIfDelayed3Days:     calc(rates.day3),
    lossIfDelayed7Days:     calc(rates.day7),
    lossIfDelayed14Days:    calc(rates.day14),
    mortalityRate3Days:     rates.day3,
    projectedDeaths3Days:   Math.round(fishCount * rates.day3),
  };
}
```

---

## 8. DISEASE DATA MAP (All 7 Classes)

```typescript
// src/utils/diseaseData.ts
export const DISEASE_DATA = {
  "Healthy Fish": {
    icon: "🐟", color: "#22C55E", urgency: "healthy", category: "Healthy",
    symptoms: "Normal colouration, intact fins, clear eyes, active movement.",
    causes: { environmental: ["Good water quality", "Adequate oxygen"], biological: [] },
    treatment: { medicines: ["None required"], preventive: ["Weekly water quality checks", "Avoid overfeeding"] },
    mortalityStages: [0, 0, 0, 0],
    progressionDays: [0, 0, 0, 0],
  },
  "Bacterial Red Disease": {
    icon: "🔴", color: "#EF4444", urgency: "treat", category: "Bacterial",
    symptoms: "Red hemorrhagic spots on skin, fins, and body. Ulcers may appear.",
    causes: {
      environmental: ["Poor water quality", "Low dissolved oxygen", "High ammonia", "Water temperature > 30°C"],
      biological: ["Pseudomonas fluorescens", "Vibrio species", "Secondary infection after injury"],
    },
    treatment: {
      medicines: [
        { name: "Oxytetracycline", dose: "50 mg/L bath for 1 hour", cost: "~₹80/pond", availability: "Rural agri stores" },
        { name: "Potassium permanganate", dose: "2 ppm for 30 min", cost: "~₹20/pond", availability: "Universal" },
      ],
      preventive: ["Improve aeration", "Reduce stocking density", "30% water change every 3 days"],
    },
    mortalityStages: [0.10, 0.30, 0.55, 0.75],
    progressionDays: [0, 3, 7, 14],
  },
  // ... repeat for all 7 classes
};

export const URGENCY_CONFIG = {
  healthy:  { label: "All Good",         color: "#22C55E", icon: "✅", action: "No action needed" },
  monitor:  { label: "Monitor Closely",  color: "#EAB308", icon: "👁",  action: "Watch for worsening over 48 hours" },
  treat:    { label: "Treat Now",         color: "#F97316", icon: "💊", action: "Begin treatment immediately" },
  isolate:  { label: "ISOLATE POND",     color: "#EF4444", icon: "🚨", action: "Critical — isolate and call expert now" },
};
```

---

## 9. FLASK BACKEND ENTRY POINT

```python
# backend/app.py
from flask import Flask
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials

from routes.detect import detect_bp
from routes.explain import explain_bp
from routes.economic import economic_bp
from routes.timeline import timeline_bp
from routes.risk import risk_bp
from routes.outbreak import outbreak_bp
from routes.similarity import similarity_bp
from routes.translate import translate_bp

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

app = Flask(__name__)
CORS(app, origins=["https://aquaguard.in", "http://localhost:5173"])

app.register_blueprint(detect_bp,     url_prefix="/api/v1")
app.register_blueprint(explain_bp,    url_prefix="/api/v1")
app.register_blueprint(economic_bp,   url_prefix="/api/v1")
app.register_blueprint(timeline_bp,   url_prefix="/api/v1")
app.register_blueprint(risk_bp,       url_prefix="/api/v1")
app.register_blueprint(outbreak_bp,   url_prefix="/api/v1")
app.register_blueprint(similarity_bp, url_prefix="/api/v1")
app.register_blueprint(translate_bp,  url_prefix="/api/v1")

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000)
```

---

## 10. FLASK — DETECT ROUTE

```python
# backend/routes/detect.py
from flask import Blueprint, request, jsonify
from firebase_admin import auth
from ml.model import predict
from ml.gradcam import generate_gradcam
from ml.preprocessor import preprocess_from_url
from data.disease_info import get_disease_info
from data.economic_factors import calculate_loss
from data.timeline_templates import generate_timeline
import httpx, numpy as np

detect_bp = Blueprint("detect", __name__)

def verify_token(req):
    token = req.headers.get("Authorization", "").replace("Bearer ", "")
    return auth.verify_id_token(token)

@detect_bp.route("/detect", methods=["POST"])
def detect():
    try:
        decoded = verify_token(request)
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401

    body = request.json
    image_url   = body["imageUrl"]
    pond_id     = body.get("pondId")
    fish_count  = body.get("fishCount", 0)
    market_price= body.get("marketPricePerKg", 120)
    avg_weight  = body.get("avgWeightKg", 0.35)

    # Preprocess
    img_array = preprocess_from_url(image_url)  # returns (1,224,224,3)

    # Classify
    probs = predict(img_array)  # softmax(7)
    top_idx = int(np.argmax(probs))
    disease = CLASSES[top_idx]
    confidence = float(probs[top_idx])

    # XAI Heatmap
    heatmap_url = generate_gradcam(img_array, top_idx, image_url)

    # Disease info
    info = get_disease_info(disease)

    # Economic loss
    economic = calculate_loss(disease, fish_count, market_price, avg_weight)

    # Timeline
    timeline = generate_timeline(disease, info["severity"])

    return jsonify({
        "disease": disease,
        "confidence": confidence,
        "severity": info["severity"],
        "urgency": info["urgency"],
        "category": info["category"],
        "heatmapUrl": heatmap_url,
        "reasoning": info["reasoning"],
        "top3": [{"label": CLASSES[i], "confidence": float(probs[i])}
                 for i in np.argsort(probs)[::-1][:3]],
        "economicLoss": economic,
        "timeline": timeline,
    })

CLASSES = [
    "Bacterial Red Disease", "Bacterial diseases - Aeromoniasis",
    "Bacterial Gill Disease", "Fungal diseases Saprolegniasis",
    "Healthy Fish", "Parasitic Diseases", "Viral diseases White tail disease",
]
```

---

## 11. FLASK — GRAD-CAM ENGINE

```python
# backend/ml/gradcam.py
import tensorflow as tf
import numpy as np, cv2, base64, uuid
from firebase_admin import storage

def generate_gradcam(img_array, class_idx, original_url):
    from ml.model import model

    grad_model = tf.keras.Model(
        inputs=model.inputs,
        outputs=[model.get_layer("Conv_1").output, model.output]
    )
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        loss = predictions[:, class_idx]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    heatmap = conv_outputs[0] @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap).numpy()
    heatmap = np.maximum(heatmap, 0) / (heatmap.max() + 1e-8)

    # Resize and overlay on original image
    heatmap_resized = cv2.resize(heatmap, (224, 224))
    heatmap_uint8   = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

    # Download original image
    import httpx
    r = httpx.get(original_url)
    orig = cv2.imdecode(np.frombuffer(r.content, np.uint8), cv2.IMREAD_COLOR)
    orig = cv2.resize(orig, (224, 224))

    overlay = cv2.addWeighted(orig, 0.6, heatmap_colored, 0.4, 0)

    # Upload to Firebase Storage
    _, buffer = cv2.imencode(".jpg", overlay, [cv2.IMWRITE_JPEG_QUALITY, 80])
    blob_name = f"heatmaps/{uuid.uuid4()}.jpg"
    bucket = storage.bucket()
    blob = bucket.blob(blob_name)
    blob.upload_from_string(buffer.tobytes(), content_type="image/jpeg")
    blob.make_public()
    return blob.public_url
```

---

## 12. TELEGRAM BOT SERVICE

```python
# backend/services/telegram_bot.py
import telegram, asyncio
from data.disease_info import get_disease_info

bot = telegram.Bot(token="YOUR_BOT_TOKEN")  # from .env

async def send_report(chat_id: str, detection: dict):
    info = get_disease_info(detection["disease"])
    loss = detection.get("economicLoss", {})

    urgency_icons = {
        "healthy": "✅", "monitor": "👁", "treat": "💊", "isolate": "🚨"
    }
    icon = urgency_icons.get(detection["urgency"], "⚠️")

    text = f"""
🐟 *AquaGuard XAI — Disease Report*
━━━━━━━━━━━━━━━━━━━━
{icon} *Disease:* {detection['disease']}
📊 *Confidence:* {round(detection['confidence']*100)}% | *Severity:* {detection['severity']}
🏥 *Treatment:* {info['treatment']['medicines'][0]['name']} — {info['treatment']['medicines'][0]['dose']}
💰 *Loss if delayed 3 days:* ₹{loss.get('lossIfDelayed3Days', 'N/A'):,}
━━━━━━━━━━━━━━━━━━━━
📋 *Reasoning:* {detection['reasoning']}
🔗 Full report: https://aquaguard.in/report/{detection['detectionId']}
    """.strip()

    await bot.send_message(chat_id=chat_id, text=text, parse_mode="Markdown")

def send_report_sync(chat_id: str, detection: dict):
    asyncio.run(send_report(chat_id, detection))
```

---

## 13. PWA SERVICE WORKER (Offline)

```javascript
// public/sw.js
const CACHE_NAME = "aquaguard-v1";
const OFFLINE_ASSETS = [
  "/", "/index.html", "/manifest.json",
  "/model/model_int8.onnx",
  "/offline.html",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS))
  );
});

self.addEventListener("fetch", (e) => {
  if (!navigator.onLine) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || caches.match("/offline.html"))
    );
    return;
  }
  // Network first for API, cache first for assets
  if (e.request.url.includes("/api/")) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then((cached) => cached || fetch(e.request)));
  }
});

// Background sync for queued detections
self.addEventListener("sync", (e) => {
  if (e.tag === "sync-detections") {
    e.waitUntil(syncQueuedDetections());
  }
});

async function syncQueuedDetections() {
  const queue = JSON.parse(localStorage.getItem("detection_queue") || "[]");
  for (const item of queue) {
    try {
      await fetch("/api/v1/detect", { method: "POST", body: JSON.stringify(item) });
    } catch {}
  }
}
```

---

## 14. NPM DEPENDENCIES

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "firebase": "^10.8.0",
    "zustand": "^4.5.0",
    "onnxruntime-web": "^1.17.0",
    "leaflet": "^1.9.4",
    "recharts": "^2.12.0",
    "i18next": "^23.10.0",
    "react-i18next": "^14.1.0",
    "vite-plugin-pwa": "^0.19.0",
    "jspdf": "^2.5.1",
    "react-dropzone": "^14.2.3"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "vite": "^5.1.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@types/leaflet": "^1.9.8"
  }
}
```

---

## 15. PYTHON REQUIREMENTS

```txt
# backend/requirements.txt
flask==3.0.2
flask-cors==4.0.0
tensorflow==2.15.0
onnxruntime==1.17.1
tf2onnx==1.16.1
opencv-python-headless==4.9.0.80
numpy==1.26.4
Pillow==10.2.0
httpx==0.27.0
firebase-admin==6.4.0
python-telegram-bot==21.0
scikit-learn==1.4.1
gunicorn==21.2.0
python-dotenv==1.0.1
requests==2.31.0
```

---

## 16. ENVIRONMENT VARIABLES

```bash
# frontend/.env
VITE_FB_API_KEY=
VITE_FB_AUTH_DOMAIN=
VITE_FB_PROJECT_ID=
VITE_FB_STORAGE_BUCKET=
VITE_FB_MESSAGING_SENDER_ID=
VITE_FB_APP_ID=
VITE_FLASK_API_URL=http://localhost:5000

# backend/.env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
TELEGRAM_BOT_TOKEN=
LIBRETRANSLATE_URL=http://localhost:5001
MODEL_PATH=./models/mobilenetv2_fish.h5
ONNX_PATH=./models/model.onnx
```

---

*AquaGuard XAI Frontend & Backend Skills Reference | Version 1.0 | April 2025*
