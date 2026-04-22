# 🔄 System Workflow Documentation
## AquaGuard XAI — Complete End-to-End Flows
**Version:** 1.0 | April 2025

---

## 1. MASTER SYSTEM ARCHITECTURE FLOW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FARMER'S PHONE                                  │
│         React PWA (Firebase Hosting) — Android Chrome / iOS Safari        │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Login │ Scan │ XAI Report │ Economic Panel │ Timeline │ Maps       │  │
│  │  Voice Bot │ Dashboard │ Vet Locator │ Offline Mode                │  │
│  └────────────────────────────┬────────────────────────────────────────┘  │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │ HTTPS + Firebase ID Token
                    ┌───────────┴───────────┐
                    │    FIREBASE LAYER      │
                    │  Auth │ Firestore      │
                    │  Storage │ FCM         │
                    │  Cloud Functions       │
                    └───────────┬───────────┘
                                │ REST API
                    ┌───────────┴───────────┐
                    │   FLASK BACKEND        │
                    │   Python 3.11          │
                    │   (Docker + Render/    │
                    │    Railway free tier)  │
                    │                        │
                    │  /detect               │
                    │  /explain (Grad-CAM)   │
                    │  /economic-loss        │
                    │  /action-timeline      │
                    │  /pond-risk            │
                    │  /outbreak-predict     │
                    │  /similarity           │
                    │  /translate            │
                    └──┬────────┬────────────┘
                       │        │
             ┌─────────┘        └──────────┐
             ▼                             ▼
   MobileNetV2 Model               Telegram Bot API
   ONNX Runtime                    LibreTranslate
   Grad-CAM Engine                 Leaflet + OSM
   Embedding Index                 Firebase Firestore
```

---

## 2. AUTHENTICATION WORKFLOW

```
USER OPENS APP
      │
      ▼
Select Language
(EN / हिं / తె / বাং / ଓ)
      │
      ▼
┌─────────────────────┐
│   Choose Auth Method │
├─────────────────────┤
│  📱 Phone OTP       │  ← Primary (rural farmers)
│  🔵 Google OAuth    │  ← Experts, admins
│  📧 Email+Password  │  ← Institutional
└──────┬──────────────┘
       │
  [PHONE OTP PATH]
       │
       ▼
Enter +91 mobile number
       │
       ▼
Firebase sends OTP via SMS
(RecaptchaVerifier — invisible)
       │
       ▼
User enters 6-digit OTP
       │
       ▼
firebase.auth.signInWithPhoneNumber
.confirm(otp)
       │
       ▼
onAuthStateChanged fires
       │
       ▼
Check Firestore: users/{uid} exists?
       │
  ┌────┴─────┐
  NO        YES
  │          │
  ▼          ▼
Create     Load existing
user doc   profile + ponds
  {
    role: "farmer",
    language: "te",
    region: "",
    ponds: [],
    createdAt: now
  }
       │
       ▼
Store Firebase ID Token
(auto-refreshes every 60 min)
       │
       ▼
NAVIGATE TO HOME DASHBOARD
```

---

## 3. CORE DETECTION + XAI WORKFLOW

```
FARMER TAPS "SCAN FISH"
         │
         ▼
Choose Input:
📷 Live Camera  OR  🖼️ Upload Photo
         │
         ▼
Image Preview Screen
[Retake] [Proceed]
         │
         ▼
Select Pond  (Pond A / B / C)
Enter Fish Count + Market Price
(optional — for economic calc)
         │
         ▼
CLIENT PREPROCESSING
┌─────────────────────────────────┐
│ 1. Canvas resize → 224×224 px   │
│ 2. Convert to blob/base64       │
│ 3. Validate: jpg/png, <10MB     │
└──────────────┬──────────────────┘
               │
               ▼
ONLINE CHECK
┌─────────────────┐
│  Has internet?   │
└──┬──────────┬───┘
   YES        NO
   │           │
   ▼           ▼
Upload to    Run ONNX
Firebase     model in
Storage      browser
(get URL)    (offline mode)
   │           │
   ▼           │
POST /api/v1/detect
Headers: Authorization: Bearer {token}
Body: { imageUrl, pondId, fishCount,
        marketPricePerKg, avgWeightKg }
   │
   ▼
FLASK: verify Firebase token
   │
   ▼
Download image from Firebase Storage
   │
   ▼
Preprocess: resize, normalize [0,1]
   │
   ▼
MobileNetV2 inference
→ softmax probabilities (7 classes)
   │
   ▼
Top prediction + confidence
   │
   ├──────────────────────────────────┐
   ▼                                  ▼
Grad-CAM heatmap generation     Top-3 class list
(async, returns URL)
   │
   ├──────────────────────────────────┐
   ▼                                  ▼
Disease info lookup             Economic loss calc
(treatment, causes,             (mortality rate ×
severity, reasoning)             fish count × price)
   │
   ├──────────────────────────────────┐
   ▼                                  ▼
Action timeline generation      Similarity search
(day-by-day plan)               (top-3 similar cases
                                 from embedding index)
   │
   ▼
Save to Firestore:
detections/{uid}/{detectionId}
   │
   ├──────────────────────────────────┐
   ▼                                  ▼
Return JSON to React          Trigger Telegram Bot
(render XAI Report Card)      (send formatted report
                               to linked chat ID)
   │
   ▼
CHECK OUTBREAK THRESHOLD
(Firebase Cloud Function)
→ ≥3 critical in 7 days in pond?
→ YES: send FCM push + Telegram alert
```

---

## 4. XAI REPORT RENDERING FLOW

```
JSON response received by React
            │
            ▼
┌───────────────────────────────┐
│ 1. Urgency Banner             │  ← First thing rendered
│    (Critical / Treat / etc)   │    Full-width, coloured
└───────────────────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ 2. Disease Card               │
│    - Name + icon + category   │
│    - Confidence gauge         │
│    - Severity badge           │
└───────────────────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ 3. XAI Explanation Panel      │
│    - Fish image (original)    │
│    - Grad-CAM heatmap overlay │
│      (fades in when URL ready)│
│    - Reasoning text           │
│      "Detected due to..."     │
│    - Feature importance list  │
└───────────────────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ 4. Trust Meter                │
│    - Confidence %             │
│    - High / Medium / Low      │
│    - "Expert recommended"     │
│      if < 70% confidence      │
└───────────────────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ 5. Class Confidence Chart     │
│    (all 7 classes, bar chart) │
└───────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│ 6. Tabs: Treatment | Economic |       │
│          Timeline | Similar | Causes  │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ 7. Action Buttons             │
│    [📄 PDF] [📱 Telegram]    │
│    [🩺 Expert Review]         │
└───────────────────────────────┘
```

---

## 5. GRAD-CAM GENERATION FLOW

```
Received: image array (1,224,224,3) + class_idx
          │
          ▼
Build grad_model:
  inputs  = model.inputs
  outputs = [model.get_layer("Conv_1").output, model.output]
          │
          ▼
GradientTape:
  conv_outputs, predictions = grad_model(image)
  loss = predictions[:, class_idx]
          │
          ▼
Compute gradient:
  grads = tape.gradient(loss, conv_outputs)
  pooled_grads = mean(grads, axis=(0,1,2))
          │
          ▼
Generate heatmap:
  heatmap = conv_outputs[0] @ pooled_grads
  heatmap = ReLU(heatmap)
  heatmap = normalize(heatmap) → [0,1]
          │
          ▼
Resize heatmap: (7,7) → (224,224)
          │
          ▼
Colorize with JET colormap (OpenCV)
          │
          ▼
Overlay on original image:
  result = 0.6×original + 0.4×heatmap_colored
          │
          ▼
Encode as JPEG (quality 80)
          │
          ▼
Upload to Firebase Storage: heatmaps/{uuid}.jpg
          │
          ▼
Return public URL → React renders overlay
Total additional latency: ~250–400ms
```

---

## 6. ECONOMIC LOSS CALCULATION FLOW

```
INPUTS:
  disease       = "Bacterial Red Disease"
  fish_count    = 5000
  market_price  = ₹120/kg
  avg_weight    = 0.35 kg
         │
         ▼
value_per_fish = avg_weight × market_price
              = 0.35 × 120 = ₹42
         │
         ▼
Lookup mortality table:
  disease → { day0: 10%, day3: 30%, day7: 55%, day14: 75% }
         │
         ▼
Calculate losses:
  loss_today    = 5000 × 0.10 × 42 = ₹21,000
  loss_3days    = 5000 × 0.30 × 42 = ₹63,000
  loss_7days    = 5000 × 0.55 × 42 = ₹1,15,500
  loss_14days   = 5000 × 0.75 × 42 = ₹1,57,500

  treatment_cost = fish_count × ₹0.024 ≈ ₹120
         │
         ▼
Return: comparison table + chart data
         │
         ▼
React renders:
  [Treat today: ₹120] vs [Delay 7 days: ₹1,15,500]
  → Farmer sees the cost of inaction instantly
```

---

## 7. ACTION TIMELINE GENERATION FLOW

```
INPUTS: disease, severity, fish_count, pond_size_m2
         │
         ▼
Load timeline template for disease
(from data/timeline_templates.py)
         │
         ▼
Adjust dosage by pond_size_m2:
  base_dose × (pond_size / 100)
         │
         ▼
Generate day objects:
  Day 0: Immediate isolation tasks
  Day 1: First treatment application
  Day 3: Second treatment + observation
  Day 5: Third treatment + re-scan
  Day 7: Assessment + conditional escalation
  Day 10: Final treatment (if still present)
  Day 14: Recovery check or expert escalation
         │
         ▼
Each day contains:
  { day, title, tasks[], medicine, dosage,
    waterCheck, observationNote, escalationTrigger }
         │
         ▼
Return timeline array → React renders
TimelineRail component (vertical stepper)
```

---

## 8. OUTBREAK PREDICTION WORKFLOW

```
TRIGGER: Every new detection saved to Firestore
          │
          ▼
Firebase Cloud Function: onDocumentCreated
  path: detections/{uid}/{detectionId}
          │
          ▼
Query Firestore:
  detections of same pondId
  where timestamp > now - 7 days
  where urgency in ["treat", "isolate"]
          │
          ▼
Count critical detections = N
          │
     ┌────┴─────┐
     N<3        N≥3
     │           │
  No action     ▼
            Outbreak threshold crossed!
                │
                ▼
         Calculate probability:
           P = min(0.99, N/5 × base_rate)
                │
                ▼
         Save to Firestore:
           outbreaks/{alertId}
                │
                ├──────────────────────────┐
                ▼                          ▼
         FCM push to farmer         Telegram alert
         "Outbreak risk in          to farmer +
          Pond C — Act now"         assigned expert
                │
                ▼
         Update pond doc:
           riskStatus = "Critical"
           healthScore recalculated
```

---

## 9. TELEGRAM INTEGRATION WORKFLOW

### Setup (One-time)
```
1. Farmer opens @AquaGuardBot in Telegram
2. Sends /start
3. Bot replies: "Send /link to get your link code"
4. Farmer sends /link
5. Bot replies: "Your code: 7X4K2P (valid 10 min)"
6. Farmer opens AquaGuard app → Settings → Link Telegram
7. Enters code → app POSTs to Flask /telegram/link
8. Flask maps code → uid → saves chatId to Firestore
9. Farmer confirmed: "Telegram linked ✅"
```

### Per-Detection (Automatic)
```
Detection saved to Firestore
         │
         ▼
Flask checks: user has telegramChatId?
         │
    YES  │  NO
         │  └── Skip
         ▼
Format Telegram message
(Markdown with disease, confidence,
 treatment, economic loss, timeline D0)
         │
         ▼
python-telegram-bot: bot.send_message()
         │
         ▼
If urgency = "isolate":
  Also send: heatmap image
  Also send: vet locator link
```

---

## 10. OFFLINE MODE WORKFLOW

```
APP DETECTS: navigator.onLine === false
         │
         ▼
Show amber banner: "📡 Offline Mode"
"Detection works · Sync later"
         │
         ▼
User scans fish (camera works offline)
         │
         ▼
Load ONNX model from Service Worker cache
(/model/model_int8.onnx — pre-cached on install)
         │
         ▼
Run onnxruntime-web inference in browser
→ Returns: disease, confidence, top-3
         │
         ▼
Generate local report
(no heatmap — requires server)
(no economic calc — uses last known values)
         │
         ▼
Save to localStorage queue:
  detection_queue: [{imageBlob, result, pondId, timestamp}]
         │
         ▼
Show "Offline badge" on result card
"Heatmap & full report available when online"
         │
         ▼
WHEN CONNECTIVITY RESTORED:
Service Worker 'sync' event fires
         │
         ▼
Flush detection_queue:
  For each queued item:
  1. Upload image to Firebase Storage
  2. POST to /api/v1/detect with imageUrl
  3. Get full result (heatmap, economic, timeline)
  4. Update Firestore detection doc
  5. Remove from queue
         │
         ▼
Notify user: "3 scans synced ✅"
```

---

## 11. VOICE CHATBOT WORKFLOW

```
FARMER TAPS 🎙 VOICE FAB
         │
         ▼
Web Speech API: SpeechRecognition starts
lang = "te-IN" (user language)
         │
         ▼
User speaks command
(e.g., "చేప స్కాన్ చేయి" = "scan fish" in Telugu)
         │
         ▼
SpeechRecognition.onresult
→ transcript = "scan fish" / "స్కాన్"
         │
         ▼
handleVoiceCommand(transcript)
         │
  ┌──────┴──────────────────┐
  │ Match against intents:  │
  │ "scan" → open camera    │
  │ "report" → read TTS     │
  │ "vet" → open map        │
  │ "treatment" → timeline  │
  │ "telegram" → send report│
  │ "hindi" → set lang hi   │
  └──────┬──────────────────┘
         │
         ▼
Execute matched action
+ SpeechSynthesis.speak(response)
  ("Starting fish scan..." / "స్కాన్ ప్రారంభిస్తున్నాను...")
```

---

## 12. SIMILARITY ANALYSIS FLOW

```
After detection: extract feature embedding
         │
         ▼
Global Average Pooling layer output:
  embedding = feature_extractor.predict(img)
  shape: (1, 1280)
         │
         ▼
Query embedding index (Firestore / numpy array):
  stored_embeddings = load all detection embeddings
  scores = cosine_similarity(embedding, stored_embeddings)
         │
         ▼
Sort by similarity score (descending)
Take top-3 (excluding self)
         │
         ▼
Fetch detection details for top-3 IDs
Return: [{ caseId, similarity, disease, imageUrl, date }]
         │
         ▼
React renders: Similarity Browser
  3 cards with photo + similarity % + disease label
  Farmer can compare side-by-side
```

---

## 13. ML TRAINING PIPELINE

```
DATASET
2,444 images / 7 classes
Train: 1,750 | Test: 700
         │
         ▼
EDA (01_eda.ipynb)
  - Class distribution
  - Image resolution analysis
  - Sample visualisation
  - Pixel value histograms
         │
         ▼
PREPROCESSING (02_preprocessing.ipynb)
  - Rename files (clean class names)
  - Resize all to 224×224
  - Split validation set (200 from train)
  - Save preprocessed tfrecords
         │
         ▼
TRAINING (03_training.ipynb)
  Phase 1: Train head only (10 epochs)
    Base: MobileNetV2 frozen
    LR: 1e-3
    Batch: 32
    Loss: categorical_crossentropy
    Metrics: accuracy, top-3 accuracy

  Phase 2: Fine-tune top 30 layers (30 epochs)
    LR: 1e-4
    Callbacks:
      EarlyStopping(patience=5)
      ReduceLROnPlateau(factor=0.5, patience=3)
      ModelCheckpoint(save_best_only=True)
         │
         ▼
EVALUATION (04_evaluation.ipynb)
  - Test set accuracy (target ≥ 92%)
  - Per-class precision, recall, F1
  - Confusion matrix
  - ROC-AUC per class
         │
         ▼
GRAD-CAM VALIDATION (05_gradcam_test.ipynb)
  - Visual inspection of heatmaps
  - Ensure hot regions align with visible symptoms
  - Test on 10 samples per class
         │
         ▼
EXPORT (06_export_onnx.ipynb)
  model.save('mobilenetv2_fish.h5')
  tf2onnx.convert → model.onnx
  quantize INT8 → model_int8.onnx (offline PWA)
         │
         ▼
DEPLOY
  Flask + Gunicorn (Docker)
  model.onnx loaded via onnxruntime
  model_int8.onnx bundled in public/model/
```

---

*AquaGuard XAI Workflow Documentation | Version 1.0 | April 2025*
