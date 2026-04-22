# 📋 Product Requirements Document
## Explainable AI-Based Fish Disease Detection & Aquaculture Intelligence System
### "AquaGuard XAI"

---

**Version:** 2.0  
**Date:** April 2025  
**Type:** Hackathon Submission — Problem Statement #2  
**Dataset:** 2,444 images | 7 Disease Classes | Train: 1,750 | Test: 700  
**Team:** AquaGuard  
**Status:** Ready for Development

---

## TABLE OF CONTENTS

1. Executive Summary
2. Problem Statement
3. Objectives
4. User Personas
5. User Stories
6. Functional Requirements
7. Non-Functional Requirements
8. System Architecture
9. Data Flow
10. AI/ML Approach
11. UI/UX Design Overview
12. API Design
13. Database Schema
14. Integration Details
15. Risk Analysis
16. Limitations
17. Future Scope
18. Success Metrics
19. Demo Flow

---

## 1. EXECUTIVE SUMMARY

AquaGuard XAI is a next-generation aquaculture intelligence platform that transforms basic fish disease detection into a complete, explainable, and actionable disease management ecosystem. Unlike simple classification apps, AquaGuard XAI provides AI transparency through visual heatmaps, generates day-wise treatment timelines, predicts economic losses before they occur, and delivers intelligent outbreak alerts — all accessible to rural Indian farmers via a multilingual voice-enabled mobile interface.

The system is trained on a 2,444-image dataset covering 7 freshwater fish disease classes specific to South Asian aquaculture (tilapia, carp, catfish). It combines MobileNetV2 for fast mobile inference with Grad-CAM explainability, Flask REST APIs, Firebase Firestore for persistence, and deep integrations with Telegram, Leaflet.js maps, and Web Speech API.

**Why AquaGuard XAI wins a hackathon:**

- It solves a real, high-impact problem affecting millions of Indian farmers
- It goes 10x deeper than any existing tool: XAI + economic prediction + action timeline + outbreak forecast
- Every feature is buildable within the hackathon window using free tools
- The demo is visually stunning and technically rigorous

---

## 2. PROBLEM STATEMENT

### 2.1 Context

Freshwater aquaculture supports over 14 million farmers in India, generating ₹1.5 lakh crore annually. Diseases like Aeromoniasis, Saprolegniasis, and White Tail Disease cause 30–50% mortality rates when undetected. Yet the tools available to farmers today are:

- Manual visual inspection (slow, inconsistent, requires expert knowledge)
- Generic disease lookup websites (not India-specific, no image analysis)
- Expensive veterinary consultations (unavailable in remote districts)

### 2.2 Specific Gaps

| Gap | Current Reality | AquaGuard XAI Solution |
|---|---|---|
| No visual explanation | Black-box AI results | Grad-CAM heatmap shows infected region |
| No financial context | Farmers don't know cost of inaction | Economic Loss Predictor |
| No treatment roadmap | "Use medicine X" is all you get | Day-by-day Action Timeline |
| No outbreak intelligence | Reactive, not proactive | Smart Outbreak Prediction |
| No rural accessibility | English-only, screen-heavy UIs | Voice chatbot + multilingual |
| No trusted AI | Farmers distrust unexplained AI | Trust Meter + expert escalation |

### 2.3 The Problem in Numbers

- Average loss per undetected outbreak: ₹80,000 – ₹3,00,000 per pond
- Detection delay without tools: 5–10 days
- Coverage of aquaculture vets in rural India: 1 per 500+ farmers
- Mobile penetration in rural India: 62% (mostly Android, basic 4G)

---

## 3. OBJECTIVES

### 3.1 Primary Objectives

- O1: Detect and classify fish diseases from images with ≥ 92% accuracy across 7 classes
- O2: Provide Explainable AI (XAI) output that shows why a diagnosis was made
- O3: Deliver India-specific treatment recommendations in 5 regional languages
- O4: Predict economic loss before a farmer chooses to act or delay
- O5: Generate a day-wise treatment action timeline for every diagnosis

### 3.2 Secondary Objectives

- O6: Predict pond-level outbreak risk using historical detection trends
- O7: Integrate Telegram for instant report delivery without app navigation
- O8: Map nearby veterinarians using free Leaflet.js + OpenStreetMap
- O9: Support offline detection for farmers with poor internet connectivity
- O10: Build farmer trust through AI transparency (Trust Meter feature)

---

## 4. USER PERSONAS

### Persona 1 — Raju Yadav (Primary — Rural Farmer)

| Field | Detail |
|---|---|
| Age | 42 |
| Location | Nellore, Andhra Pradesh |
| Occupation | Tilapia & carp farmer, 4 ponds |
| Device | Basic Android (4G), 5-inch screen |
| Language | Telugu primary, limited Hindi |
| Literacy | Moderate — prefers voice, visual cues |
| Pain Points | Can't identify diseases early, lost 60% stock last season, no nearby vet |
| Goal | Know what disease it is, what to buy, how much it will cost him if he waits |

### Persona 2 — Dr. Priya Menon (Secondary — Aquaculture Expert)

| Field | Detail |
|---|---|
| Age | 35 |
| Location | Kochi, Kerala |
| Occupation | Fisheries extension officer, state govt |
| Device | Desktop + Android |
| Language | English, Malayalam |
| Goal | Review flagged cases, monitor regional disease trends, send alerts |

### Persona 3 — Arjun Singh (Secondary — Progressive Farmer)

| Field | Detail |
|---|---|
| Age | 28 |
| Location | Bhopal, Madhya Pradesh |
| Occupation | Tech-savvy fish farmer, uses apps daily |
| Device | Mid-range Android + occasional laptop |
| Language | Hindi, English |
| Goal | Dashboard analytics, export PDF reports, track pond health over time |

### Persona 4 — Admin (Internal)

| Field | Detail |
|---|---|
| Role | Platform administrator |
| Goal | Manage users, monitor model performance, view regional outbreak heatmap |

---

## 5. USER STORIES

### Epic 1: Core Disease Detection

- **US-01:** As Raju, I want to take a photo of my sick fish so that I get an instant AI diagnosis.
- **US-02:** As Raju, I want to see which part of the fish is infected (highlighted) so that I trust the AI result.
- **US-03:** As Raju, I want to know the severity level so that I understand how urgent the situation is.
- **US-04:** As Raju, I want to hear the diagnosis in Telugu so that I don't need to read English.

### Epic 2: Explainability & Trust

- **US-05:** As Arjun, I want to see why the AI made this decision so that I can validate it myself.
- **US-06:** As any user, I want a Trust Meter so that I know when to trust the AI vs. call an expert.
- **US-07:** As Dr. Priya, I want to see the top 3 similar cases from history so that I can compare diagnoses.

### Epic 3: Economic Intelligence

- **US-08:** As Raju, I want to know how much money I will lose if I don't treat my fish today so that I take action immediately.
- **US-09:** As Raju, I want a day-by-day plan so that I know exactly what to do each morning.
- **US-10:** As Arjun, I want to input fish count and market price so that the economic estimate is accurate for my pond.

### Epic 4: Outbreak & Risk Intelligence

- **US-11:** As Dr. Priya, I want to see a pond risk score dashboard so that I can prioritize which farmers to call.
- **US-12:** As any farmer, I want to be warned before an outbreak happens so that I can take preventive action.

### Epic 5: Integrations & Accessibility

- **US-13:** As Raju, I want to receive the full diagnosis on Telegram so that I can share it with my family and the local vet.
- **US-14:** As Raju, I want to find the nearest fisheries vet on a map so that I can call for help.
- **US-15:** As Raju, I want to ask questions with my voice so that I don't need to type.
- **US-16:** As any farmer, I want the detection to work without internet so that I can use it even in remote ponds.

---

## 6. FUNCTIONAL REQUIREMENTS

### F1 — AI Disease Detection Engine

| ID | Requirement |
|---|---|
| F1.1 | Accept image input via live camera or file upload (JPG, JPEG, PNG) |
| F1.2 | Preprocess image: resize to 224×224, normalize, augment if needed |
| F1.3 | Run MobileNetV2 inference on 7-class disease dataset |
| F1.4 | Return: disease name, confidence score (%), top-3 alternatives |
| F1.5 | Return severity level: Mild / Moderate / Severe / Critical |
| F1.6 | Fallback to cached ONNX model in offline mode |

**7 Disease Classes:**

| # | Class | Category | Urgency |
|---|---|---|---|
| 1 | Healthy Fish | — | None |
| 2 | Bacterial Red Disease | Bacterial | High |
| 3 | Bacterial Gill Disease | Bacterial | High |
| 4 | Bacterial Diseases – Aeromoniasis | Bacterial | Critical |
| 5 | Fungal Diseases – Saprolegniasis | Fungal | Medium |
| 6 | Parasitic Diseases | Parasitic | High |
| 7 | Viral Diseases – White Tail Disease | Viral | Critical |

### F2 — Explainable AI (XAI) Diagnosis

| ID | Requirement |
|---|---|
| F2.1 | Generate Grad-CAM heatmap overlay on input image |
| F2.2 | Display reasoning text: "Detected due to [region], [visual cue]" |
| F2.3 | Show feature importance: top contributing visual features |
| F2.4 | Display confidence breakdown across all 7 classes (bar chart) |

### F3 — Cause Identification

| ID | Requirement |
|---|---|
| F3.1 | Map each disease to known environmental causes (water quality, temperature, O2) |
| F3.2 | Map each disease to biological/transmission causes |
| F3.3 | Display preventive conditions with current recommendation |

### F4 — Treatment Recommendation Engine

| ID | Requirement |
|---|---|
| F4.1 | Return specific medicine name, dosage, and application method per disease |
| F4.2 | Include India-specific, low-cost alternatives (available in rural markets) |
| F4.3 | Include preventive steps post-treatment |
| F4.4 | Flag any medicine requiring prescription |

### F5 — Disease Progression Simulator

| ID | Requirement |
|---|---|
| F5.1 | Show stage-wise disease progression: Stage 1 → Stage 4 |
| F5.2 | Estimate days to each stage if untreated |
| F5.3 | Show expected mortality % at each stage |
| F5.4 | Visualize as timeline with warning icons |

### F6 — Similarity Analyzer

| ID | Requirement |
|---|---|
| F6.1 | Return top 3 visually similar cases from detection history |
| F6.2 | Show similarity score (%) and diagnosis for each case |
| F6.3 | Allow farmer to view past case photo and compare |

### F7 — Pond Risk Score System

| ID | Requirement |
|---|---|
| F7.1 | Calculate pond health score (0–100) based on recent detections |
| F7.2 | Classify pond as: Safe (>75) / Warning (50–75) / Critical (<50) |
| F7.3 | Display per-pond risk on dashboard with trend indicator |
| F7.4 | Trigger alert when pond drops from Warning to Critical |

### F8 — Trust Meter (AI Transparency)

| ID | Requirement |
|---|---|
| F8.1 | Display confidence as visual gauge (0–100%) |
| F8.2 | Show: Low (<60%), Medium (60–80%), High (>80%) confidence labels |
| F8.3 | Auto-recommend expert consultation when confidence < 70% |
| F8.4 | Show model version and training dataset size in transparency panel |

### F9 — Economic Loss Predictor

| ID | Requirement |
|---|---|
| F9.1 | Accept: fish count, species, current market price per kg, avg weight |
| F9.2 | Estimate mortality rate per disease + per stage |
| F9.3 | Calculate: Projected Loss = Fish Count × Mortality Rate × Avg Weight × Market Price |
| F9.4 | Show: Loss if treated today vs. loss if delayed 3/7/14 days |
| F9.5 | Display as comparison table and bar chart |

**Formula:**
```
Projected Loss (₹) = Fish Count × Mortality Rate (%) × Avg Fish Weight (kg) × Market Price (₹/kg)
Daily Escalation = Loss × Disease_Escalation_Factor × Days_Delayed
```

### F10 — Action Timeline Generator

| ID | Requirement |
|---|---|
| F10.1 | Generate day-wise treatment plan: Day 0 through Day 14 (or resolution) |
| F10.2 | Each day includes: Task, Medicine/Dosage, Water Quality Check, Observation Note |
| F10.3 | Include trigger conditions: "If symptoms worsen on Day 3, escalate to expert" |
| F10.4 | Downloadable as PDF or shareable via Telegram |

### F11 — Smart Outbreak Prediction

| ID | Requirement |
|---|---|
| F11.1 | Analyze detection history per pond over rolling 7-day and 30-day windows |
| F11.2 | Flag outbreak risk when: 3+ critical detections in 7 days in same pond |
| F11.3 | Display regional outbreak heatmap on admin dashboard |
| F11.4 | Send proactive alert (FCM + Telegram) when outbreak threshold crossed |

### F12 — Telegram Integration

| ID | Requirement |
|---|---|
| F12.1 | Farmer links Telegram account (one-time setup via chat ID) |
| F12.2 | After each scan, auto-send: disease name, severity, top treatment, economic estimate |
| F12.3 | Action timeline sent as formatted Telegram message |
| F12.4 | Two-way: farmer can send "/scan" in Telegram to receive scan reminder |

### F13 — Nearby Vet Locator

| ID | Requirement |
|---|---|
| F13.1 | Display map using Leaflet.js + OpenStreetMap (100% free) |
| F13.2 | Show nearby fisheries offices, aquaculture vets using government open data |
| F13.3 | Show distance, phone number, and availability where data exists |
| F13.4 | Filter by: Aquaculture Specialist / General Vet / Government Office |

### F14 — Multilingual Support

| ID | Requirement |
|---|---|
| F14.1 | UI available in: English, Hindi, Telugu, Bengali, Odia |
| F14.2 | Disease reports auto-translated using LibreTranslate (free, self-hostable) |
| F14.3 | Voice readout in user's selected language (Web Speech API) |
| F14.4 | Language preference stored in user profile |

### F15 — Voice-Based Chatbot

| ID | Requirement |
|---|---|
| F15.1 | Voice input using Web Speech API (SpeechRecognition) |
| F15.2 | Voice commands: "Start scan", "Read report", "Find nearest vet", "Treatment steps" |
| F15.3 | Voice output: Text-to-Speech readout of diagnosis and treatment |
| F15.4 | Fallback to Flask NLP API for intent matching |

### F16 — Offline Emergency Mode

| ID | Requirement |
|---|---|
| F16.1 | ONNX model bundled in PWA (via IndexedDB / Service Worker) |
| F16.2 | Detection and report generation works fully offline |
| F16.3 | Offline detections queued in localStorage |
| F16.4 | Auto-sync to Firestore when connectivity restored |

### F17 — Firebase Authentication

| ID | Requirement |
|---|---|
| F17.1 | Phone OTP login (primary — for rural farmers) |
| F17.2 | Google OAuth (for experts and admins) |
| F17.3 | Role-based access: farmer / expert / admin |
| F17.4 | Firebase ID token validation on all Flask API endpoints |

---

## 7. NON-FUNCTIONAL REQUIREMENTS

| Category | Requirement |
|---|---|
| **Performance** | AI inference < 2 seconds; Page load < 3 seconds on 4G |
| **Accuracy** | ≥ 92% classification accuracy on 700-image test set |
| **Availability** | 99.5% uptime; graceful offline fallback |
| **Scalability** | Handle 500+ concurrent users via Flask + Gunicorn |
| **Security** | All APIs protected by Firebase ID token validation |
| **Privacy** | Geolocation requires explicit consent; images purged after 90 days |
| **Accessibility** | Voice UI, large tap targets (≥ 44px), high-contrast mode |
| **Compatibility** | Android Chrome 80+, iOS Safari 14+, Desktop Chrome/Firefox |
| **Internationalisation** | UTF-8 throughout; RTL support ready |
| **Cost** | Zero paid APIs — all tools are free/open-source |

---

## 8. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                   │
│                                                                         │
│   React (Vite) PWA — Firebase Hosting                                  │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ Auth Pages │ Scan │ XAI Report │ Dashboard │ Timeline │ Maps    │  │
│   │ Voice Bot  │ Offline Mode │ Telegram Link │ Language Switcher   │  │
│   └───────────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │ HTTPS + Firebase ID Token
┌───────────────────────────────────┼─────────────────────────────────────┐
│                   FIREBASE LAYER  │                                     │
│  Firebase Auth │ Firestore │ Storage │ Cloud Functions │ FCM            │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │ REST API (Bearer token)
┌───────────────────────────────────┼─────────────────────────────────────┐
│              FLASK BACKEND (Python)│                                    │
│                                   │                                     │
│  ┌──────────────┐  ┌─────────────────────┐  ┌──────────────────────┐  │
│  │ /api/detect  │  │ /api/explain (XAI)  │  │ /api/economic-loss   │  │
│  │ MobileNetV2  │  │ Grad-CAM Engine     │  │ Loss Calculator      │  │
│  │ ONNX Runtime │  │ Feature Importance  │  │                      │  │
│  └──────────────┘  └─────────────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌─────────────────────┐  ┌──────────────────────┐  │
│  │ /api/timeline│  │ /api/risk-score     │  │ /api/outbreak-pred   │  │
│  │ Day planner  │  │ Pond scoring        │  │ Trend analysis       │  │
│  └──────────────┘  └─────────────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌─────────────────────┐                            │
│  │ /api/similar │  │ /api/translate      │                            │
│  │ Similarity   │  │ LibreTranslate      │                            │
│  └──────────────┘  └─────────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
  Firebase Firestore    Telegram Bot API     Leaflet.js Maps
  (SQLite fallback)     (python-telegram-    (OpenStreetMap)
                         bot library)
```

---

## 9. DATA FLOW

### 9.1 Detection Flow

```
Farmer captures image
        │
        ▼
React client: resize → 224×224 → base64
        │
        ▼
Upload to Firebase Storage → get URL
        │
        ▼
POST /api/detect (with Firebase token)
        │
        ▼
Flask: verify token → download image → preprocess
        │
        ▼
MobileNetV2 inference → softmax(7 classes)
        │
        ▼
Grad-CAM: generate heatmap overlay
        │
        ▼
Severity mapper → Urgency classifier → Disease info lookup
        │
        ▼
Economic Loss Calculator (if fish count provided)
        │
        ▼
Action Timeline Generator
        │
        ▼
Save to Firestore: detections/{uid}/{id}
        │
        ├── Return JSON to React (render Report Card)
        │
        └── Trigger Telegram Bot: send formatted report
```

### 9.2 Offline Flow

```
No internet detected → load ONNX model from Service Worker cache
        │
        ▼
Run inference locally in browser (onnxruntime-web)
        │
        ▼
Store result in localStorage queue
        │
        ▼
On internet restored: sync queue to Firestore via background sync
```

---

## 10. AI/ML APPROACH

### 10.1 Dataset

| Property | Value |
|---|---|
| Total Images | 2,444 |
| Train | 1,750 (250 per class) |
| Test | 700 (100 per class) |
| Balance | Perfectly balanced |
| Species | Tilapia, Carp, Catfish |
| Classes | 7 (Healthy + 6 disease types) |

### 10.2 Model Architecture

```
Input: 224×224×3 RGB image
        │
        ▼
MobileNetV2 (pretrained ImageNet, include_top=False)
  - Depthwise Separable Convolutions
  - 53 layers (bottleneck blocks)
  - Output: 7×7×1280 feature map
        │
        ▼
GlobalAveragePooling2D → 1280-dim vector
        │
        ▼
Dense(256, activation='relu')
Dropout(0.35)
BatchNormalization()
        │
        ▼
Dense(7, activation='softmax') → 7-class probabilities
```

### 10.3 Training Strategy

```
Phase 1 — Feature Extraction (Epochs 1–10):
  - Freeze all MobileNetV2 layers
  - Train only custom head
  - LR: 1e-3, Optimizer: Adam
  - Loss: categorical_crossentropy

Phase 2 — Fine-tuning (Epochs 11–40):
  - Unfreeze top 30 layers of MobileNetV2
  - LR: 1e-4 (reduced to prevent catastrophic forgetting)
  - Callbacks: EarlyStopping(patience=5), ReduceLROnPlateau, ModelCheckpoint
```

### 10.4 Augmentation Pipeline

```python
ImageDataGenerator(
    rescale=1./255,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.1,
    horizontal_flip=True,
    brightness_range=[0.8, 1.2],
    fill_mode='nearest'
)
```

### 10.5 Explainable AI — Grad-CAM

Gradient-weighted Class Activation Mapping (Grad-CAM) computes the gradient of the class score with respect to the final convolutional layer to produce a heatmap highlighting discriminative regions.

```python
# Simplified Grad-CAM pseudocode
def grad_cam(model, image, class_idx):
    grad_model = Model(inputs=model.inputs,
                       outputs=[model.get_layer('Conv_1').output, model.output])
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(image)
        loss = predictions[:, class_idx]
    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    heatmap = conv_outputs[0] @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy()
```

### 10.6 Similarity Analysis

Uses cosine similarity on the GlobalAveragePooling2D feature vector (1280-dim embedding) against a stored embedding index of past detections. Top-3 nearest neighbours returned.

```python
from sklearn.metrics.pairwise import cosine_similarity
embedding = feature_extractor.predict(image)  # 1280-dim
scores = cosine_similarity(embedding, stored_embeddings)
top3_idx = np.argsort(scores[0])[::-1][:3]
```

### 10.7 Export for Production

```bash
# TensorFlow SavedModel
model.save('mobilenetv2_fish_xai.h5')

# ONNX export (for offline PWA + faster serving)
python -m tf2onnx.convert --saved-model mobilenetv2_fish_xai --output model.onnx

# Quantize for edge deployment
python quantize.py --model model.onnx --output model_int8.onnx
```

### 10.8 Target Metrics

| Metric | Target |
|---|---|
| Overall Accuracy | ≥ 92% |
| Per-class F1 Score | ≥ 0.88 for all classes |
| Inference Time (Flask) | < 800ms |
| Inference Time (ONNX Web) | < 2 seconds |
| Grad-CAM Generation | < 300ms additional |

---

## 11. UI/UX DESIGN OVERVIEW

*(See DESIGN.md for full specification)*

### 11.1 Design Principles

- **Voice-first, visual-second:** Every key action accessible by voice command
- **Triage at a glance:** Urgency level visible within 1 second of result loading
- **Trust by design:** Explanation panel always accompanies every diagnosis
- **Rural-optimised:** Large tap targets, offline badge, low-bandwidth imagery

### 11.2 Screen Inventory

| Screen | Description |
|---|---|
| Login | Phone OTP + Google OAuth + language selection |
| Home Dashboard | Pond cards, outbreak alerts, quick scan CTA |
| Scan | Camera capture + upload + pond selector |
| XAI Report | Heatmap, diagnosis, severity, trust meter |
| Economic Panel | Loss calculator + projection chart |
| Action Timeline | Day-by-day plan (Day 0–14) |
| Progression Simulator | Stage 1–4 visual timeline |
| Similarity Browser | Top 3 similar past cases |
| Pond Risk Dashboard | All ponds + risk score + trend |
| Vet Locator | Leaflet.js map + filter |
| Voice Assistant | Chat + voice bubbles interface |
| Settings | Language, Telegram link, notifications |
| Admin Panel | Regional heatmap, model stats, user management |

### 11.3 Color System

| Token | Value | Usage |
|---|---|---|
| --primary | #00C896 | Primary actions, healthy state |
| --accent | #00A3E0 | Secondary actions, water theme |
| --danger | #EF4444 | Critical urgency, outbreaks |
| --warning | #EAB308 | Medium risk, monitor states |
| --safe | #22C55E | Healthy, confirmed safe |
| --bg-deep | #030F0B | Main background |
| --surface | rgba(255,255,255,0.04) | Card surfaces |

---

## 12. API DESIGN

### Base URL: `https://api.aquaguard.in/api/v1`

All endpoints require: `Authorization: Bearer <firebase_id_token>`

---

### POST /detect

**Request:**
```json
{
  "imageUrl": "https://storage.firebase.com/...",
  "pondId": "pond_123",
  "fishCount": 5000,
  "marketPricePerKg": 120,
  "avgWeightKg": 0.35
}
```

**Response:**
```json
{
  "detectionId": "det_abc123",
  "disease": "Bacterial Red Disease",
  "confidence": 0.94,
  "severity": "High",
  "category": "Bacterial",
  "urgency": "treat",
  "top3": [
    { "label": "Bacterial Red Disease", "confidence": 0.94 },
    { "label": "Bacterial Gill Disease", "confidence": 0.04 },
    { "label": "Aeromoniasis", "confidence": 0.01 }
  ],
  "heatmapUrl": "https://storage.firebase.com/.../heatmap_abc123.jpg",
  "reasoning": "Detected due to hemorrhagic red spots on dorsal fin region and lateral body surface",
  "causes": { "environmental": [...], "biological": [...] },
  "treatment": { "medicines": [...], "preventive": [...] },
  "economicLoss": {
    "estimatedLossToday": 84000,
    "lossIfDelayed3Days": 142800,
    "lossIfDelayed7Days": 252000,
    "mortalityRate": 0.40
  },
  "similarCases": [
    { "caseId": "det_xyz", "similarity": 0.91, "disease": "Bacterial Red Disease", "imageUrl": "..." }
  ]
}
```

---

### POST /explain

**Request:**
```json
{ "imageUrl": "...", "diseaseClass": "Bacterial Red Disease" }
```

**Response:**
```json
{
  "heatmapUrl": "...",
  "featureImportance": [
    { "feature": "Dorsal fin hemorrhage", "weight": 0.72 },
    { "feature": "Lateral body discoloration", "weight": 0.58 },
    { "feature": "Skin ulceration", "weight": 0.41 }
  ],
  "classConfidences": {
    "Healthy Fish": 0.01,
    "Bacterial Red Disease": 0.94,
    "Bacterial Gill Disease": 0.03,
    ...
  }
}
```

---

### POST /action-timeline

**Request:**
```json
{
  "disease": "Bacterial Red Disease",
  "severity": "High",
  "fishCount": 5000,
  "pondSizeM2": 500
}
```

**Response:**
```json
{
  "timeline": [
    { "day": 0, "tasks": ["Isolate infected fish", "Stop feeding"], "medicine": "None yet", "observation": "Count visible infected fish" },
    { "day": 1, "tasks": ["Prepare Oxytetracycline bath"], "medicine": "Oxytetracycline 50mg/L for 1 hour", "observation": "Check for new spots" },
    { "day": 3, "tasks": ["Repeat bath treatment", "30% water change"], "medicine": "Oxytetracycline 50mg/L", "observation": "If worsening → call expert" },
    ...
  ]
}
```

---

### GET /pond-risk/{pondId}

**Response:**
```json
{
  "pondId": "pond_123",
  "score": 41,
  "status": "Critical",
  "trend": "declining",
  "recentDetections": 7,
  "criticalCount": 4,
  "outbreakRisk": "High"
}
```

---

### POST /outbreak-predict

**Request:**
```json
{ "pondId": "pond_123", "windowDays": 7 }
```

**Response:**
```json
{
  "outbreakProbability": 0.83,
  "riskLevel": "High",
  "triggerFactors": ["4 Aeromoniasis detections in 7 days", "Declining pond score"],
  "recommendation": "Immediate intervention required"
}
```

---

### POST /telegram/send-report

**Request:**
```json
{
  "chatId": "123456789",
  "detectionId": "det_abc123"
}
```

---

### POST /translate

**Request:**
```json
{
  "text": "Bacterial Red Disease detected. Apply Oxytetracycline immediately.",
  "targetLang": "te"
}
```

**Response:**
```json
{
  "translatedText": "బ్యాక్టీరియల్ రెడ్ డిసీజ్ గుర్తించబడింది. వెంటనే ఆక్సీటెట్రాసైక్లిన్ వేయండి.",
  "language": "Telugu"
}
```

---

## 13. DATABASE SCHEMA

### Firestore Collections

```
users/{uid}
├── name: string
├── phone: string
├── email: string
├── role: "farmer" | "expert" | "admin"
├── region: string
├── language: "en" | "hi" | "te" | "bn" | "or"
├── telegramChatId: string
├── ponds: string[]
├── fcmToken: string
└── createdAt: timestamp

ponds/{pondId}
├── ownerId: string
├── name: string
├── location: { lat: number, lng: number }
├── areaSqM: number
├── species: string[]
├── fishCount: number
├── marketPricePerKg: number
├── avgWeightKg: number
├── healthScore: number (0–100)
├── riskStatus: "Safe" | "Warning" | "Critical"
└── createdAt: timestamp

detections/{uid}/{detectionId}
├── disease: string
├── confidence: number
├── severity: "Mild" | "Moderate" | "High" | "Critical"
├── urgency: "healthy" | "monitor" | "treat" | "isolate"
├── category: string
├── pondId: string
├── imageUrl: string
├── heatmapUrl: string
├── reasoning: string
├── top3: array
├── economicLoss: object
├── timeline: array
├── location: { lat: number, lng: number }
├── expertReviewed: boolean
├── expertDiagnosis: string
├── embedding: number[] (1280-dim for similarity)
└── timestamp: timestamp

consultations/{consultationId}
├── detectionId: string
├── farmerId: string
├── expertId: string
├── status: "pending" | "in_progress" | "resolved"
├── aiResult: object
├── expertDiagnosis: string
├── messages: subcollection
└── timestamps: { created, updated, resolved }

outbreaks/{alertId}
├── pondId: string
├── farmerId: string
├── triggerCount: number
├── diseases: string[]
├── probability: number
├── status: "active" | "resolved"
├── alertedAt: timestamp
└── resolvedAt: timestamp
```

### SQLite Schema (Offline Fallback)

```sql
CREATE TABLE detections (
  id TEXT PRIMARY KEY,
  uid TEXT NOT NULL,
  disease TEXT NOT NULL,
  confidence REAL,
  severity TEXT,
  pond_id TEXT,
  image_path TEXT,
  heatmap_path TEXT,
  reasoning TEXT,
  economic_loss_json TEXT,
  timeline_json TEXT,
  synced INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ponds (
  id TEXT PRIMARY KEY,
  uid TEXT NOT NULL,
  name TEXT,
  fish_count INTEGER,
  market_price REAL,
  avg_weight REAL,
  health_score INTEGER,
  risk_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 14. INTEGRATION DETAILS

### 14.1 Telegram Bot Integration

**Setup:**
1. Create bot via @BotFather → get `BOT_TOKEN`
2. Farmer sends `/start` in Telegram → bot replies with 6-digit link code
3. Farmer enters code in AquaGuard app → links `telegramChatId` to Firestore profile

**Report Message Format:**
```
🐟 AquaGuard XAI — Disease Report
━━━━━━━━━━━━━━━━━━━━
🔴 Disease: Bacterial Red Disease
📊 Confidence: 94% | Severity: HIGH
🏥 Treatment: Oxytetracycline 50mg/L bath (1 hour)
⏰ Day 1 Action: Isolate infected fish immediately
💰 Economic Risk: ₹84,000 loss if untreated today
━━━━━━━━━━━━━━━━━━━━
⚠️ ISOLATE POND — High outbreak risk
📍 Nearest Vet: Dr. Ramesh, 4.2 km away
🔗 Full Report: https://aquaguard.in/report/det_abc123
```

**Library:** `python-telegram-bot` (free, no paid tier)

---

### 14.2 Leaflet.js Vet Locator

**Stack:** Leaflet.js + OpenStreetMap (100% free)

**Data Sources:**
- Government fisheries offices: data.gov.in open datasets
- Manually curated vet list: stored in Firestore `vets` collection
- Overpass API for searching OpenStreetMap `veterinary` nodes

**Implementation:**
```javascript
import L from 'leaflet';
const map = L.map('map').setView([userLat, userLng], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
vets.forEach(vet => {
  L.marker([vet.lat, vet.lng])
   .addTo(map)
   .bindPopup(`<b>${vet.name}</b><br>${vet.phone}<br>${vet.distance} km`);
});
```

---

### 14.3 Web Speech API

**Voice Commands Supported:**
```
"Start scan"          → opens camera
"Read report"         → TTS reads diagnosis
"Find nearest vet"    → opens map
"Treatment steps"     → reads Day 0 timeline
"Switch to Hindi"     → changes language
"Send to Telegram"    → triggers Telegram send
```

**Implementation:**
```javascript
const recognition = new window.SpeechRecognition();
recognition.lang = userLanguage;  // 'te-IN', 'hi-IN', 'bn-IN'
recognition.onresult = (event) => {
  const command = event.results[0][0].transcript.toLowerCase();
  handleVoiceCommand(command);
};
```

---

### 14.4 LibreTranslate (Free Translation)

**Self-hosted or use public instance:**
```bash
pip install libretranslate
libretranslate --host 0.0.0.0 --port 5001
```

**API Call:**
```python
import requests
response = requests.post("http://localhost:5001/translate", json={
    "q": "Bacterial Red Disease detected",
    "source": "en",
    "target": "te"
})
translated = response.json()["translatedText"]
```

---

## 15. RISK ANALYSIS

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Model accuracy < 90% on real-world images | Medium | High | Data augmentation, test on diverse phone camera conditions |
| Grad-CAM adds latency > 500ms | Medium | Medium | Async generation; return base result first, heatmap after |
| Telegram API rate limits | Low | Low | Queue messages; send max 1 per detection |
| Rural internet too slow for full response | High | High | Compress heatmap JPEG 60%; offline ONNX fallback |
| LibreTranslate quality poor for Telugu/Odia | Medium | Medium | Manual review of translations; fallback to English |
| Firebase Firestore costs at scale | Low | Medium | Set daily budget alerts; use SQLite for offline-first |
| Farmer doesn't trust AI diagnosis | High | High | Trust Meter + expert escalation + XAI reasoning text |
| Voice commands misfire in noisy rural environments | Medium | Low | Manual fallback for every voice action |

---

## 16. LIMITATIONS

1. **Grad-CAM precision** — heatmaps highlight discriminative regions, not exact lesion boundaries. Not a medical-grade tool.
2. **Economic estimates are approximations** — mortality rates are disease-class averages, not personalised to pond microbiome or water conditions.
3. **Similarity analysis** — works best when historical detection database has 100+ entries; sparse at launch.
4. **Outbreak prediction** — trained on frequency heuristics, not a proper epidemiological model.
5. **Translation quality** — LibreTranslate free tier is adequate for simple sentences; complex medical text may need review.
6. **Offline Grad-CAM** — heatmap generation requires server; offline mode returns classification only (no heatmap).
7. **Vet locator data** — dependent on OpenStreetMap completeness; rural areas may have sparse coverage.
8. **Species limitation** — model trained on tilapia, carp, catfish images; accuracy may drop for other species.

---

## 17. FUTURE SCOPE

| Feature | Description | Timeline |
|---|---|---|
| YOLOv8 Migration | Real-time video scanning + multi-fish detection in one frame | v2.0 |
| Water Quality Sensor Integration | IoT pH/O2/temperature sensors feeding disease risk model | v2.0 |
| Federated Learning | Model improves from new farmer detections without data centralisation | v2.5 |
| Drone Pond Monitoring | Scheduled drone flyovers → automatic AI scan of entire pond surface | v3.0 |
| Insurance Integration | Detection history used as evidence for aquaculture insurance claims | v2.5 |
| Government API Push | Auto-report outbreaks to state fisheries department portal | v2.0 |
| WhatsApp Integration | Same report pipeline via WhatsApp Business API | v2.0 |
| Predictive Water Quality | ML model predicting disease risk from environmental sensor trends | v3.0 |

---

## 18. SUCCESS METRICS

| Metric | v1.0 Target | v2.0 Target |
|---|---|---|
| Model accuracy (test set) | ≥ 92% | ≥ 95% |
| Inference time (server) | < 2 seconds | < 1 second |
| Inference time (offline ONNX) | < 3 seconds | < 2 seconds |
| Daily active farmers (3 months) | 500+ | 2,000+ |
| Telegram reports sent / day | 100+ | 500+ |
| Expert escalation rate | < 20% | < 10% |
| False negative rate (disease missed) | < 5% | < 3% |
| Farmer satisfaction score | ≥ 4.2/5 | ≥ 4.6/5 |
| Economic loss prevented (estimated) | ₹50L/month | ₹2Cr/month |
| Languages active | 5 | 8 |

---

## 19. DEMO FLOW (Hackathon Presentation)

**Total Demo Time: 5 minutes**

| Minute | Action | Wow Factor |
|---|---|---|
| 0:00–0:30 | Open app, show login via Phone OTP | Real Firebase auth |
| 0:30–1:00 | Upload fish image (pre-loaded for speed) | Live classification result |
| 1:00–1:45 | Show XAI Report: heatmap + reasoning text + Trust Meter | Grad-CAM heatmap live |
| 1:45–2:15 | Show Economic Loss predictor: input fish count → see ₹84,000 loss estimate | Unique feature, never seen before |
| 2:15–2:45 | Open Action Timeline: Day-by-day plan | Judges love actionability |
| 2:45–3:15 | Trigger Telegram: report auto-sent to phone live on stage | Gasp moment |
| 3:15–3:45 | Switch to Telugu, hear voice readout of diagnosis | Multilingual + voice = accessibility |
| 3:45–4:15 | Show Vet Locator map + nearest vet pin | Leaflet.js + real map |
| 4:15–4:45 | Show Pond Risk Dashboard: Pond C = Critical, outbreak predicted | End-to-end intelligence |
| 4:45–5:00 | Summary slide: 7 disease classes, XAI, economic predictor, 5 languages | Leave judges impressed |

---

*Document Owner: AquaGuard Team | Version 2.0 | April 2025 | Hackathon Ready*
