# 🐟 Explainable AI-Based Fish Disease Detection & Aquaculture Intelligence System
### Product Requirements Document (PRD) — Hackathon Edition
**Version:** 1.0.0 | **Date:** April 2026 | **Status:** Final Draft  
**Author:** Senior PM / AI Architect / Full-Stack Engineer  
**Classification:** Open Innovation — Hackathon Submission

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [User Personas](#4-user-personas)
5. [User Stories](#5-user-stories)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [System Architecture](#8-system-architecture)
9. [Data Flow](#9-data-flow)
10. [AI/ML Approach](#10-aiml-approach)
11. [UI/UX Design](#11-uiux-design)
12. [API Design](#12-api-design)
13. [Database Schema](#13-database-schema)
14. [Integration Details](#14-integration-details)
15. [Risk Analysis](#15-risk-analysis)
16. [Limitations](#16-limitations)
17. [Future Scope](#17-future-scope)
18. [Success Metrics](#18-success-metrics)
19. [Demo Flow](#19-demo-flow)

---

## 1. Executive Summary

**AquaDetect AI** is an open-source, explainable artificial intelligence system designed to revolutionize fish disease detection and aquaculture management in India and developing markets. Unlike conventional disease detection apps that merely output a label, AquaDetect AI delivers a full diagnostic intelligence pipeline: it identifies diseases from fish images with visual explanations, predicts economic losses, generates day-wise treatment timelines, assesses pond-wide outbreak risk, and connects farmers to local veterinary resources — all in regional Indian languages, with offline capability.

The system is architected on a React (Vite) frontend and Python Flask backend, leverages MobileNetV2/YOLOv8 for inference, and integrates Telegram, Leaflet.js maps, Web Speech API, and free translation APIs. It is fully operable on commodity hardware and free-tier cloud infrastructure, making it genuinely deployable for rural aquaculture communities.

**Elevator Pitch:** *"We don't just tell farmers what disease their fish has. We show them why we think so, what it will cost them if ignored, and exactly what to do about it — step by step, in their language, on their phone."*

---

## 2. Problem Statement

### 2.1 Industry Context

India is the third-largest fish-producing nation globally, with aquaculture contributing approximately ₹1.8 lakh crore annually to the economy and supporting livelihoods of over 2.8 crore fishers and fish farmers. Despite this scale, the sector suffers disproportionate losses from preventable fish diseases.

### 2.2 Core Pain Points

| Pain Point | Impact |
|---|---|
| Late disease detection | 40–60% mortality in untreated ponds |
| No visual explanation in current tools | Farmers distrust AI-only black-box outputs |
| Lack of economic loss visibility | Farmers underestimate urgency of treatment |
| Inaccessible veterinary expertise | Rural areas have 1 vet per 50,000 farmers |
| Language barriers | 78% of fish farmers are non-English-speaking |
| No offline support | 42% of aquaculture zones have poor connectivity |
| No outbreak prediction | Disease spreads across adjacent ponds silently |

### 2.3 Existing Solutions & Their Gaps

Current tools such as basic image classifiers or government SMS advisories:
- Output only a disease name without confidence justification
- Provide no visual region highlighting (no explainability)
- Have no economic or timeline context
- Are English-only
- Require constant internet access
- Give no pond-level risk aggregation or outbreak forecasting

**AquaDetect AI addresses every one of these gaps.**

### 2.4 Opportunity

With smartphone penetration reaching 54% in rural India and government schemes like PM Matsya Sampada Yojana investing ₹20,050 crore in aquaculture, a free, explainable, multilingual AI tool is both timely and impactful.

---

## 3. Objectives

### 3.1 Primary Objectives

- **O1:** Achieve ≥85% top-1 classification accuracy on the 30 most common fish diseases in Indian aquaculture.
- **O2:** Deliver explainable diagnosis with visual heatmaps and natural-language reasoning for every prediction.
- **O3:** Generate actionable treatment timelines within 3 seconds of image upload.
- **O4:** Provide economic loss estimates calibrated to Indian market prices.
- **O5:** Support 8+ Indian languages with real-time translation.

### 3.2 Secondary Objectives

- **O6:** Enable full offline diagnosis capability synced when connectivity returns.
- **O7:** Integrate Telegram Bot for one-tap report sharing.
- **O8:** Surface nearby veterinary contacts on an interactive map.
- **O9:** Predict outbreak risk across a pond cluster from historical data.
- **O10:** Demonstrate AI transparency via a Trust Meter on every diagnosis.

### 3.3 Hackathon-Specific Goals

- Complete end-to-end working demo in ≤48 hours of development.
- Use zero paid APIs or services.
- Score high on: Innovation, Technical Depth, Social Impact, Explainability, Completeness.

---

## 4. User Personas

### Persona 1 — Raju Patil (Primary User: Small-Scale Fish Farmer)
- **Location:** Ratnagiri, Maharashtra
- **Age:** 38 | **Education:** Class 10 | **Language:** Marathi
- **Tech Literacy:** Uses WhatsApp daily; owns Android phone (₹8,000 range)
- **Pond Size:** 2–3 ponds, ~5,000 fish each (Rohu/Catla/Tilapia)
- **Pain:** Cannot afford vet visits; loses 30–40% stock annually to disease
- **Needs:** Simple image upload, explanation in Marathi, affordable medicine names, action steps
- **Goal:** Save fish stock and avoid financial ruin

### Persona 2 — Dr. Meena Iyer (Secondary User: Aquaculture Extension Officer)
- **Location:** Bangalore, Karnataka
- **Age:** 45 | **Education:** M.Sc. Fisheries Science
- **Tech Literacy:** Comfortable with web dashboards, uses Excel, WhatsApp
- **Role:** Advises 200+ farmers across 3 districts
- **Needs:** Aggregate risk dashboard, outbreak alerts, downloadable reports
- **Goal:** Scale advisory services without proportionally scaling field visits

### Persona 3 — Karthik Sundaram (Tertiary User: Aquaculture Entrepreneur)
- **Location:** Chennai, Tamil Nadu
- **Age:** 29 | **Education:** B.Tech, runs 10-pond shrimp farm
- **Tech Literacy:** High; uses farm management software
- **Needs:** Advanced trend analytics, economic dashboards, API integration, Telegram automation
- **Goal:** Minimize losses, optimize operations, get alerts before crises

### Persona 4 — Priya Nair (Support User: Government/NGO Researcher)
- **Location:** Thiruvananthapuram, Kerala
- **Age:** 34 | **Education:** Ph.D. candidate, fisheries
- **Tech Literacy:** Very high
- **Needs:** Anonymized disease incidence data, geospatial outbreak maps, exportable datasets
- **Goal:** Policy research and disease surveillance

---

## 5. User Stories

### Epic 1: Disease Detection

- **US-01:** As Raju, I want to take a photo of my sick fish and upload it, so that the system tells me what disease it has and how sure it is.
- **US-02:** As Raju, I want to see exactly which part of the fish is infected highlighted, so that I trust the diagnosis.
- **US-03:** As Raju, I want the system to explain in simple Marathi *why* it thinks so, so that I understand and share with my neighbour.
- **US-04:** As Dr. Meena, I want to see a severity rating (Mild/Moderate/Critical) alongside the diagnosis, so that I prioritize which farmers need urgent calls.

### Epic 2: Treatment & Economic Planning

- **US-05:** As Raju, I want a list of medicines available in India with dosage, so that I can act immediately without waiting for a vet.
- **US-06:** As Raju, I want a day-by-day treatment plan showing exactly what to do on Day 1, Day 2, etc., so that I never miss a step.
- **US-07:** As Karthik, I want to enter my fish count and current market price, so that the system estimates how much money I lose if I don't treat in time.
- **US-08:** As Raju, I want to see what happens if I do nothing — stage-by-stage disease worsening — so that I understand the urgency.

### Epic 3: Risk Intelligence

- **US-09:** As Dr. Meena, I want a pond risk score (Safe/Warning/Critical) that aggregates all diagnosed cases in a zone, so that I can issue area-wide advisories.
- **US-10:** As Karthik, I want outbreak predictions 5–7 days in advance based on disease trends, so that I take preventive measures early.
- **US-11:** As Raju, I want to see 3 similar disease cases with photos and their diagnoses, so that I'm more confident in the result.

### Epic 4: Trust & Transparency

- **US-12:** As Raju, I want a visible confidence percentage (e.g., "87% confident"), so that I know whether to self-treat or call a vet.
- **US-13:** As Dr. Meena, I want the system to flag low-confidence diagnoses and recommend expert consultation, so that no farmer acts on uncertain AI.

### Epic 5: Connectivity & Communication

- **US-14:** As Raju, I want to receive my full diagnosis report on Telegram automatically, so that I can share it with my family or local vet.
- **US-15:** As Raju, I want to find veterinary clinics near me on a map, so that I can visit when needed.
- **US-16:** As Raju, I want to upload a fish photo and diagnose even without internet, so that remote pond locations don't block me from getting help.
- **US-17:** As Raju, I want to speak my query in Marathi and hear the diagnosis read back, so that I don't need to read or type.

---

## 6. Functional Requirements

### FR-01: AI Disease Detection Module

| ID | Requirement |
|---|---|
| FR-01.1 | System SHALL accept JPEG/PNG/WebP fish images (max 10MB) via upload or camera capture |
| FR-01.2 | System SHALL classify the image into one of 30 disease categories or "Healthy" |
| FR-01.3 | System SHALL return top-3 predictions with confidence scores for each |
| FR-01.4 | System SHALL assign a Severity Level: Mild (0–33%), Moderate (34–66%), Critical (67–100%) |
| FR-01.5 | System SHALL complete inference within 3 seconds on a standard server CPU |

**Supported Disease Classes (Sample — Full 30 in training set):**
Ich (White Spot Disease), Bacterial Gill Disease, Fin Rot, Columnaris, Dropsy, Saprolegniasis, Velvet Disease, Anchor Worm, Swim Bladder Disease, Ulcer Disease, Aeromoniasis, Vibriosis, EUS (Epizootic Ulcerative Syndrome), WSSV (White Spot Syndrome Virus — shrimp), and 16 others.

### FR-02: Explainable AI Diagnosis Module

| ID | Requirement |
|---|---|
| FR-02.1 | System SHALL generate a Grad-CAM heatmap overlay on the original image identifying infected regions |
| FR-02.2 | System SHALL produce a bounding box around the primary infected region using YOLOv8 |
| FR-02.3 | System SHALL render a human-readable reasoning statement (e.g., "Detected due to white circular spots on the body, scale lifting, and fin discoloration") |
| FR-02.4 | Reasoning SHALL map detected visual features to known clinical indicators for that disease |
| FR-02.5 | The heatmap SHALL be color-coded: green (healthy), yellow (borderline), red (infected) |

### FR-03: Cause Identification Engine

| ID | Requirement |
|---|---|
| FR-03.1 | System SHALL display environmental causes (e.g., high ammonia, low dissolved oxygen, temperature spikes) |
| FR-03.2 | System SHALL display biological causes (e.g., Aeromonas bacteria, Ich parasite lifecycle) |
| FR-03.3 | Cause data SHALL be sourced from a curated knowledge base, not generated ad hoc |
| FR-03.4 | System SHALL suggest water quality parameters to test based on the diagnosed disease |

### FR-04: Treatment Recommendation Engine

| ID | Requirement |
|---|---|
| FR-04.1 | System SHALL recommend India-specific, commercially available medicines with generic and brand names |
| FR-04.2 | System SHALL specify dosage in grams/litre or mg/kg fish weight |
| FR-04.3 | System SHALL list preventive steps alongside curative treatment |
| FR-04.4 | System SHALL tag medicines as "Low Cost (<₹200)", "Medium Cost (₹200–₹1000)", or "Specialist Required" |
| FR-04.5 | System SHALL display a disclaimer that medicines should be confirmed with a registered aquaculture vet |

### FR-05: Disease Progression Simulator

| ID | Requirement |
|---|---|
| FR-05.1 | System SHALL display a 4-stage progression timeline (e.g., Day 0, Day 3, Day 7, Day 14) showing worsening symptoms if untreated |
| FR-05.2 | Each stage SHALL include: symptom description, estimated mortality %, and visual severity indicator |
| FR-05.3 | Progression data SHALL be disease-specific from the knowledge base |
| FR-05.4 | System SHALL display a visual graph of projected mortality rate over time |

### FR-06: Similarity Analyzer

| ID | Requirement |
|---|---|
| FR-06.1 | System SHALL retrieve top-3 visually similar cases from the case database using feature embeddings |
| FR-06.2 | Each similar case SHALL display: thumbnail image, disease name, confidence similarity score, and treatment outcome |
| FR-06.3 | Similarity search SHALL complete within 2 seconds |
| FR-06.4 | Similar cases SHALL be sourced from verified diagnostic records only |

### FR-07: Pond Risk Score System

| ID | Requirement |
|---|---|
| FR-07.1 | System SHALL accept manual pond registration (pond name, location, fish species, stock count) |
| FR-07.2 | System SHALL aggregate disease diagnoses within a pond and assign a composite risk score: Safe (0–30), Warning (31–70), Critical (71–100) |
| FR-07.3 | Risk score SHALL update in real-time with each new diagnosis |
| FR-07.4 | System SHALL display a pond risk dashboard with color-coded status indicators |
| FR-07.5 | Critical ponds SHALL trigger an in-app alert and Telegram notification |

### FR-08: Trust Meter (AI Transparency)

| ID | Requirement |
|---|---|
| FR-08.1 | System SHALL display a visual Trust Meter (0–100%) prominently on every diagnosis card |
| FR-08.2 | Confidence <60% SHALL display: "Low confidence — please consult a veterinarian" |
| FR-08.3 | Confidence 60–79% SHALL display: "Moderate confidence — cross-check with the similar cases panel" |
| FR-08.4 | Confidence ≥80% SHALL display: "High confidence — follow treatment plan and monitor" |
| FR-08.5 | System SHALL explain the model's uncertainty factors when confidence is below 70% |

### FR-09: Economic Loss Predictor

| ID | Requirement |
|---|---|
| FR-09.1 | System SHALL accept user input: total fish count, average fish weight (kg), current market price (₹/kg), pond size (hectares) |
| FR-09.2 | System SHALL estimate mortality rate for the diagnosed disease at current severity |
| FR-09.3 | System SHALL calculate: expected fish death count, revenue loss (₹), treatment cost, and net saving from treatment |
| FR-09.4 | System SHALL show a comparative bar chart: "Loss if Untreated" vs "Treatment Cost" |
| FR-09.5 | Calculations SHALL use RBI-adjusted average market prices for 10 major fish species as defaults, overridable by user |
| FR-09.6 | System SHALL project losses at Day 3, Day 7, and Day 14 intervals |

### FR-10: Action Timeline Generator

| ID | Requirement |
|---|---|
| FR-10.1 | System SHALL generate a day-wise treatment plan (Day 1 through Day 14 minimum) |
| FR-10.2 | Each day's plan SHALL include: morning actions, evening actions, medicine dosage, water quality checks, and observation notes |
| FR-10.3 | Timeline SHALL be exportable as PDF and shareable via Telegram |
| FR-10.4 | System SHALL send Telegram reminders at configured daily times |
| FR-10.5 | User SHALL be able to mark days as "Completed" and log observations |

### FR-11: Smart Outbreak Prediction

| ID | Requirement |
|---|---|
| FR-11.1 | System SHALL analyze disease incidence trends across registered ponds in a geographic cluster |
| FR-11.2 | System SHALL calculate outbreak probability score for the next 7 days |
| FR-11.3 | System SHALL surface outbreak alerts when ≥3 ponds in a 10km radius show the same disease within 5 days |
| FR-11.4 | Prediction model SHALL incorporate: disease type, season/month, water temperature (if provided), and historical outbreak patterns |
| FR-11.5 | Outbreak alerts SHALL be sent via Telegram to all registered farmers in the affected zone |

### FR-12: Telegram Integration

| ID | Requirement |
|---|---|
| FR-12.1 | System SHALL integrate with Telegram Bot API (free tier) |
| FR-12.2 | System SHALL automatically send a formatted diagnosis report upon request |
| FR-12.3 | Report SHALL include: disease name, confidence, severity, heatmap image, treatment summary, and economic estimate |
| FR-12.4 | User SHALL authenticate Telegram account via chat_id linkage |
| FR-12.5 | System SHALL support Telegram-triggered commands: /diagnose (upload photo), /report, /pondstatus, /alert |

### FR-13: Nearby Vet Locator

| ID | Requirement |
|---|---|
| FR-13.1 | System SHALL display a Leaflet.js interactive map with user's location (via browser geolocation API) |
| FR-13.2 | System SHALL show government fisheries offices, private aquaculture vets, and fish medicine dealers within 50km |
| FR-13.3 | Map markers SHALL be categorized: Government Vet (blue), Private Vet (green), Medicine Dealer (orange) |
| FR-13.4 | Each marker SHALL display: name, distance, phone number, and operating hours |
| FR-13.5 | Vet data SHALL be seeded from ICAR-CIFE directories and state fisheries department records |

### FR-14: Multilingual Support

| ID | Requirement |
|---|---|
| FR-14.1 | System SHALL support 8 Indian languages: Hindi, Marathi, Tamil, Telugu, Bengali, Kannada, Odia, Malayalam |
| FR-14.2 | System SHALL translate the full diagnosis report, treatment plan, and UI using LibreTranslate (free, self-hostable) or Bhashini API (Government of India, free) |
| FR-14.3 | Language SHALL be selectable from a persistent language picker in the navigation bar |
| FR-14.4 | All translated text SHALL be displayed inline without requiring page reload (React i18n) |
| FR-14.5 | System SHALL remember the user's language preference in localStorage |

### FR-15: Voice-Based Chatbot

| ID | Requirement |
|---|---|
| FR-15.1 | System SHALL use Web Speech API for voice input (Speech-to-Text) in supported browsers |
| FR-15.2 | System SHALL use Web Speech API SpeechSynthesis for voice output (Text-to-Speech) |
| FR-15.3 | Voice chatbot SHALL answer questions about: disease symptoms, medicines, pond care, water quality, and system usage |
| FR-15.4 | User SHALL be able to voice-trigger image diagnosis by saying "diagnose my fish" |
| FR-15.5 | Chatbot responses SHALL be read aloud in the user's selected language |
| FR-15.6 | System SHALL use a simple rule-based + keyword NLU for intent detection; no paid NLP API required |

### FR-16: Offline Emergency Mode

| ID | Requirement |
|---|---|
| FR-16.1 | System SHALL cache a quantized MobileNetV2 model (TensorFlow.js / ONNX.js) in the browser's IndexedDB |
| FR-16.2 | Offline mode SHALL perform disease classification locally in the browser without a network call |
| FR-16.3 | Offline diagnoses SHALL be queued in IndexedDB and automatically synced to the server when connectivity is restored |
| FR-16.4 | System SHALL display a visible "Offline Mode" banner when network is unavailable |
| FR-16.5 | Offline mode SHALL NOT support Grad-CAM heatmap (server-side only); it will indicate this to the user |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| NFR | Target |
|---|---|
| API response time (diagnosis) | ≤3 seconds (P95) |
| Frontend initial load (Vite bundle) | ≤2 seconds on 4G |
| Similarity search | ≤2 seconds |
| Offline model inference | ≤5 seconds on mid-range Android browser |
| Concurrent users supported (demo scale) | 50 simultaneous (Flask dev server + Gunicorn) |

### 7.2 Reliability

- System uptime target: 99% during hackathon demo window
- Offline mode ensures zero downtime for core diagnosis feature
- All diagnoses persisted locally before server sync

### 7.3 Security

- No PII stored beyond voluntarily entered username and Telegram chat_id
- Fish images processed and discarded after analysis unless user opts in to case database contribution
- CORS policy enforced on Flask API
- Rate limiting: 20 requests/minute per IP (Flask-Limiter)

### 7.4 Accessibility

- WCAG 2.1 AA compliance for color contrast and keyboard navigation
- Screen reader-compatible (ARIA labels on all diagnosis cards)
- Voice interface as primary alternative for low-literacy users
- Large touch targets (≥44×44px) for mobile

### 7.5 Scalability

- Flask API is stateless; horizontally scalable behind Nginx reverse proxy
- Firebase Firestore scales automatically (free Spark plan for hackathon)
- Model served via Flask endpoint; replaceable with TF Serving for production

### 7.6 Usability

- Onboarding completed in ≤3 taps (no mandatory registration)
- First diagnosis achievable within 60 seconds of first app launch
- Error messages in plain language (no technical jargon) in user's selected language

---

## 8. System Architecture

### 8.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LAYER                               │
│   📱 Mobile Browser  |  💻 Desktop Browser  |  🤖 Telegram Bot  │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTPS / WebSocket
┌────────────────────────────▼────────────────────────────────────┐
│                    FRONTEND LAYER                               │
│              React (Vite) SPA — Port 3000                       │
│  ┌─────────────┐ ┌───────────────┐ ┌────────────────────────┐  │
│  │ Dashboard   │ │ Diagnosis UI  │ │ Voice Chatbot (Web      │  │
│  │ Pond Risk   │ │ Heatmap View  │ │ Speech API)             │  │
│  │ Analytics   │ │ Timeline View │ │ Multilingual (i18next)  │  │
│  └─────────────┘ └───────────────┘ └────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │   Offline Engine (TensorFlow.js + IndexedDB + SW)       │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │  REST API (JSON)
┌────────────────────────────▼────────────────────────────────────┐
│                    BACKEND LAYER                                │
│              Python Flask API — Port 5000                       │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────────────┐  │
│  │ /api/diagnose│ │ /api/economic│ │ /api/outbreak-predict  │  │
│  │ /api/heatmap │ │ /api/timeline│ │ /api/pond-risk         │  │
│  │ /api/similar │ │ /api/causes  │ │ /api/translate         │  │
│  └──────────────┘ └──────────────┘ └────────────────────────┘  │
└──────┬─────────────────────┬──────────────────────┬────────────┘
       │                     │                      │
┌──────▼──────┐   ┌──────────▼────────┐  ┌─────────▼──────────┐
│  AI ENGINE  │   │   DATABASE LAYER  │  │  INTEGRATION LAYER │
│ MobileNetV2 │   │ Firebase Firestore │  │ Telegram Bot API   │
│ YOLOv8      │   │ (primary)         │  │ Leaflet.js         │
│ Grad-CAM    │   │ SQLite (offline   │  │ LibreTranslate API │
│ Feat. Embed │   │ fallback)         │  │ Web Speech API     │
└─────────────┘   └───────────────────┘  └────────────────────┘
```

### 8.2 Component Breakdown

#### Frontend Components (React/Vite)

| Component | Purpose |
|---|---|
| `ImageUploader` | Camera + file upload with preview |
| `DiagnosisCard` | Disease name, confidence, severity badge |
| `HeatmapViewer` | Overlay Grad-CAM on original image |
| `TrustMeter` | Animated confidence gauge |
| `TreatmentPanel` | Medicine list, dosage, steps |
| `TimelineView` | Day-wise scrollable treatment calendar |
| `EconomicDashboard` | Charts: loss projection, treatment ROI |
| `ProgressionSimulator` | Stage-wise worsening timeline |
| `SimilarCasesPanel` | Thumbnail grid with similarity scores |
| `PondRiskDashboard` | Aggregate risk card per pond |
| `OutbreakAlert` | Banner + map heatmap for outbreak zones |
| `VetLocatorMap` | Leaflet.js interactive map |
| `VoiceChatbot` | Microphone UI + chat bubble interface |
| `LanguagePicker` | Dropdown with 8 Indian language options |
| `OfflineBanner` | Network status indicator |
| `TelegramConnector` | Chat_id linking UI |

#### Backend Modules (Flask)

| Module | File | Responsibility |
|---|---|---|
| Diagnosis Engine | `ai/classifier.py` | MobileNetV2 inference |
| Object Detector | `ai/detector.py` | YOLOv8 bounding box |
| GradCAM Generator | `ai/gradcam.py` | Heatmap overlay generation |
| Similarity Engine | `ai/similarity.py` | Feature embedding + cosine similarity |
| Knowledge Base | `data/knowledge_base.json` | Diseases, causes, treatments, progressions |
| Economic Calculator | `modules/economics.py` | Loss prediction formulas |
| Timeline Generator | `modules/timeline.py` | Day-wise plan builder |
| Outbreak Predictor | `modules/outbreak.py` | Trend analysis logic |
| Pond Risk Scorer | `modules/pond_risk.py` | Aggregate scoring |
| Telegram Handler | `integrations/telegram_bot.py` | Bot API webhook handler |
| Translation Service | `integrations/translator.py` | LibreTranslate/Bhashini wrapper |

---

## 9. Data Flow

### 9.1 Primary Diagnosis Flow

```
User uploads image
       │
       ▼
[Frontend] Validate file type/size
       │ POST /api/diagnose (multipart/form-data)
       ▼
[Flask] Receive image → preprocess (resize 224×224, normalize)
       │
       ▼
[MobileNetV2] Inference → Top-3 class probabilities
       │
       ├──► [Grad-CAM] Generate heatmap → encode as base64 PNG
       │
       ├──► [YOLOv8] Detect infected region → bounding box coordinates
       │
       ├──► [Knowledge Base] Look up: disease info, causes, treatment, progression
       │
       ├──► [Similarity Engine] Embed image features → cosine search → top-3 similar
       │
       └──► [Economic Calculator] If user inputs provided → loss estimates
       │
[Flask] Assemble DiagnosisResponse JSON
       │
[Frontend] Render all panels simultaneously
       │
[Async] → [Firebase] Store diagnosis record
       │
[Async] → [Telegram Bot] Send formatted report (if connected)
```

### 9.2 Offline Sync Flow

```
[Offline] TensorFlow.js model → classify image in browser
       │
[IndexedDB] Store: {image_b64, prediction, timestamp, pond_id}
       │
[Service Worker] Monitor network connectivity
       │ On reconnect:
       ▼
[Frontend] POST queued records to /api/diagnose/sync
       │
[Flask] Process each queued record, return full diagnosis
       │
[Firebase] Persist final record
```

### 9.3 Outbreak Prediction Flow

```
[Scheduler] Every 6 hours OR on new diagnosis
       │
[Flask /api/outbreak-predict]
       │
[Firebase Query] Fetch diagnoses from last 14 days, grouped by geohash
       │
[Outbreak Module] Sliding window analysis:
  - Same disease in cluster ≥ threshold → raise alert
  - Severity trend increasing → escalate score
  - Season/temperature factor multiplier
       │
[Response] OutbreakRisk per zone: {zone, risk_score, disease, affected_ponds}
       │
[Telegram] Bulk notification to farmers in affected zone
```

---

## 10. AI/ML Approach

### 10.1 Primary Classification Model: MobileNetV2

**Why MobileNetV2:**
- Lightweight (14MB), runs on CPU in <1s
- Pretrained on ImageNet; fine-tunable on small datasets
- Proven in mobile/edge deployment
- Free, open-source (TensorFlow/Keras)

**Training Pipeline:**

```
Dataset Sources:
  - Fish Disease Dataset (Kaggle) — ~6,000 images, 12 classes
  - ICAR-CIFE published disease imagery
  - Web-scraped & manually verified — ~2,000 images
  - Synthetic augmentation — 5× multiplier
Total: ~40,000 images, 30 classes

Preprocessing:
  - Resize to 224×224
  - Normalize pixel values [0, 1]
  - Augmentation: random flip, rotation ±20°, brightness ±0.2, zoom 0.8–1.2

Model Architecture:
  MobileNetV2 (ImageNet pretrained, frozen base layers)
  → GlobalAveragePooling2D
  → Dense(256, relu) + Dropout(0.3)
  → Dense(30, softmax)

Training:
  Optimizer: Adam (lr=1e-4)
  Loss: Categorical Crossentropy
  Epochs: 50 + early stopping (patience=5)
  Validation split: 80/20
  Target: ≥85% top-1 accuracy on held-out test set
```

### 10.2 Object Detection: YOLOv8 Nano

**Why YOLOv8n:**
- Smallest YOLOv8 variant (6.3MB), fast CPU inference
- Real-time bounding box detection
- Pretrained on COCO; fine-tunable on custom fish disease regions
- Free, open-source (Ultralytics)

**Training Target:**
- Annotate infected regions in 2,000 images using Roboflow (free tier)
- Detect: lesion areas, fin damage zones, scale lift regions, discoloration patches
- Output: bounding box coordinates for front-end rendering

### 10.3 Explainability: Grad-CAM

**Implementation:**
```python
# Simplified Grad-CAM with TF GradientTape
with tf.GradientTape() as tape:
    last_conv_output, preds = grad_model(img_array)
    class_channel = preds[:, pred_index]

grads = tape.gradient(class_channel, last_conv_output)
pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
heatmap = last_conv_output[0] @ pooled_grads[..., tf.newaxis]
heatmap = tf.squeeze(heatmap)
heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
```
- Heatmap resized and overlaid on original image with alpha blending
- Output: PNG with cool-to-hot colormap (blue → yellow → red)

### 10.4 Similarity Search: Feature Embeddings

- Extract penultimate layer (Dense-256) activations as 256-d feature vector per image
- Store vectors in SQLite (numpy float32 blob) for all ~2,000 verified cases
- At inference time: compute cosine similarity between new image vector and database
- Return top-3 with similarity score as percentage

### 10.5 Offline Model: TensorFlow.js

- Convert trained Keras model to TF.js layers format: `tensorflowjs_converter`
- Quantize to INT8 for browser (reduces model to ~4MB)
- Load via IndexedDB caching in Service Worker
- Limitation: No Grad-CAM offline; returns top-1 prediction only with confidence

### 10.6 Outbreak Prediction: Statistical Rule Engine

- For hackathon scope: time-series frequency analysis (rolling 7-day window)
- Weighted factors: recency (w=0.4), severity (w=0.3), cluster density (w=0.2), season (w=0.1)
- Outbreak threshold: ≥3 diagnoses of same disease in 10km radius within 5 days
- Future: LSTM time-series model (see Section 17)

---

## 11. UI/UX Design

### 11.1 Design Principles

1. **Mobile-First:** All layouts designed for 360px width minimum; fluid scaling up to 1440px
2. **Single-Thumb Usability:** All primary actions reachable in bottom navigation zone
3. **Progressive Disclosure:** Core result (disease name + severity) shown immediately; details expand on demand
4. **Color Semantics:** Green = Safe/Healthy, Amber = Warning, Red = Critical — consistent across all components
5. **Literacy-Agnostic:** Icons paired with every text label; voice alternative for all written content

### 11.2 Navigation Structure

```
AquaDetect AI
├── Home (Quick Diagnose)
│   ├── Camera/Upload
│   └── Recent Diagnoses Feed
├── Diagnosis Result
│   ├── Disease Card + Trust Meter
│   ├── Heatmap / Detection View
│   ├── Cause Identification
│   ├── Treatment Panel
│   ├── Day-wise Timeline
│   ├── Economic Loss Panel
│   ├── Disease Progression Simulator
│   └── Similar Cases
├── My Ponds
│   ├── Pond Risk Dashboard
│   └── Add/Edit Pond
├── Outbreak Map
│   ├── Zone Risk Heatmap
│   └── Prediction Alerts
├── Vet Locator (Map)
└── Settings
    ├── Language Selector
    ├── Telegram Connect
    ├── Fish Price Config
    └── Notification Preferences
```

### 11.3 Key Screen Wireframes (Described)

**Home Screen:**
- Large camera icon (50% of screen) with "Tap to Diagnose" label
- Below: 3 most recent diagnoses as cards with disease name + severity badge
- Top bar: Pond risk summary pill ("2 ponds: Warning") + language selector + offline indicator

**Diagnosis Result Screen:**
- Top: Disease name (large, bold) + severity badge (colored) + confidence percentage
- Trust Meter: Animated circular gauge with color fill (red/amber/green)
- Heatmap Viewer: Original image + toggle for heatmap overlay + bounding box
- Reasoning box: Gray card with italic text — "Detected due to..."
- Horizontal scrollable section cards below: Treatment | Timeline | Economics | Causes | Progression | Similar Cases
- Fixed bottom bar: "Send to Telegram" | "Find Vet" | "Share Report"

**Economic Loss Panel:**
- Input fields: Fish Count | Avg Weight | Market Price
- Output: Animated counter showing ₹ loss at Day 3 / Day 7 / Day 14
- Bar chart: "Treatment Cost" (green) vs "Untreated Loss" (red)
- Call-to-action: "Start Treatment Now" button linked to timeline

**Pond Risk Dashboard:**
- Card grid: One card per registered pond
- Card shows: Pond name, species, stock count, risk badge, active diseases
- Tap → Detailed history and trend chart

### 11.4 Color Palette & Typography

| Token | Color | Usage |
|---|---|---|
| `primary` | `#0077B6` | Buttons, links, icons |
| `success` | `#2DC653` | Safe/Healthy states |
| `warning` | `#F4A261` | Warning states |
| `danger` | `#E63946` | Critical states |
| `neutral-bg` | `#F8FAFC` | Page background |
| `card-bg` | `#FFFFFF` | Card surfaces |
| `text-primary` | `#1A1A2E` | Body text |
| `text-muted` | `#6B7280` | Secondary text |

- **Font:** Inter (Google Fonts, free) — chosen for legibility in regional scripts
- **Icon Library:** Lucide React (free, MIT licensed)

---

## 12. API Design

### Base URL: `http://localhost:5000/api`

### 12.1 POST /diagnose

**Request:**
```json
{
  "image": "<base64-encoded image string>",
  "pond_id": "pond_abc123",
  "fish_count": 5000,
  "avg_weight_kg": 0.5,
  "market_price_per_kg": 120,
  "language": "mr"
}
```

**Response (200 OK):**
```json
{
  "diagnosis_id": "dx_20260422_001",
  "timestamp": "2026-04-22T10:30:00Z",
  "top_predictions": [
    { "disease": "Ich (White Spot Disease)", "confidence": 0.87, "severity": "Moderate" },
    { "disease": "Velvet Disease", "confidence": 0.09, "severity": null },
    { "disease": "Healthy", "confidence": 0.04, "severity": null }
  ],
  "primary_disease": "Ich (White Spot Disease)",
  "confidence": 0.87,
  "severity": "Moderate",
  "trust_level": "High",
  "trust_message": "High confidence — follow treatment plan and monitor",
  "heatmap_image_b64": "<base64 PNG of heatmap overlay>",
  "bounding_box": { "x": 120, "y": 85, "width": 200, "height": 160 },
  "reasoning": "Detected due to small white circular spots distributed across body surface, scale lifting at dorsal fin, and slight discoloration around gill area.",
  "causes": {
    "environmental": ["Water temperature above 28°C", "High stocking density", "Poor aeration"],
    "biological": ["Ichthyophthirius multifiliis parasite (ciliated protozoan)", "Lifecycle: tomont → theront → trophont on host"]
  },
  "treatment": {
    "medicines": [
      { "name": "Malachite Green + Formalin", "brand": "AquaCure ICH", "dosage": "0.1 mg/L for 1 hour bath", "cost_band": "Low (<₹200)" },
      { "name": "Salt Bath (NaCl)", "brand": "Table Salt", "dosage": "3–5 g/L for 10 minutes", "cost_band": "Very Low (<₹50)" }
    ],
    "preventive_steps": ["Quarantine new fish for 14 days", "Maintain water temperature 22–26°C", "Improve aeration"],
    "disclaimer": "Consult a registered aquaculture veterinarian before administering medication."
  },
  "progression": [
    { "day": 0, "stage": "Early", "symptoms": "Few white spots, mild lethargy", "mortality_pct": 5 },
    { "day": 3, "stage": "Developing", "symptoms": "Widespread spots, flashing behavior, appetite loss", "mortality_pct": 15 },
    { "day": 7, "stage": "Advanced", "symptoms": "Heavy encrustation, breathing difficulty, mass deaths begin", "mortality_pct": 40 },
    { "day": 14, "stage": "Critical", "symptoms": "90% mortality without intervention", "mortality_pct": 90 }
  ],
  "similar_cases": [
    { "case_id": "case_00123", "thumbnail_url": "/static/cases/case_00123.jpg", "disease": "Ich", "similarity": 0.93, "outcome": "Resolved with Malachite Green in 10 days" },
    { "case_id": "case_00456", "thumbnail_url": "/static/cases/case_00456.jpg", "disease": "Ich", "similarity": 0.88, "outcome": "Resolved with salt bath in 14 days" },
    { "case_id": "case_00789", "thumbnail_url": "/static/cases/case_00789.jpg", "disease": "Velvet Disease", "similarity": 0.71, "outcome": "Copper sulfate treatment, 60% survival" }
  ],
  "economic_loss": {
    "fish_at_risk": 5000,
    "estimated_deaths_day3": 750,
    "estimated_deaths_day7": 2000,
    "estimated_deaths_day14": 4500,
    "revenue_loss_day14_inr": 270000,
    "treatment_cost_inr": 1200,
    "net_saving_inr": 268800
  },
  "action_timeline": [
    { "day": 1, "morning": "Increase aeration. Add salt bath: 3g/L for 10 min.", "evening": "Check for new spots. Record count.", "observation": "Expect no improvement yet." },
    { "day": 2, "morning": "Apply Malachite Green solution 0.1mg/L.", "evening": "Partial water change (30%). Re-aerate.", "observation": "Monitor for fish distress." }
  ],
  "translated": false
}
```

### 12.2 GET /pond-risk/{pond_id}

**Response:**
```json
{
  "pond_id": "pond_abc123",
  "risk_score": 62,
  "risk_level": "Warning",
  "active_diseases": ["Ich"],
  "diagnosis_count_last_7d": 3,
  "recommended_action": "Treat immediately and test water quality parameters."
}
```

### 12.3 POST /economic-estimate

**Request:**
```json
{
  "disease": "Ich (White Spot Disease)",
  "severity": "Moderate",
  "fish_count": 5000,
  "avg_weight_kg": 0.5,
  "market_price_per_kg": 120
}
```

**Response:** (Economic subset of /diagnose response)

### 12.4 GET /outbreak-predict?lat={lat}&lng={lng}&radius_km={radius}

**Response:**
```json
{
  "zone": "Ratnagiri Cluster",
  "outbreak_risk_score": 74,
  "outbreak_risk_level": "High",
  "predicted_disease": "Ich (White Spot Disease)",
  "affected_ponds": 4,
  "forecast_window_days": 7,
  "alert_message": "High outbreak risk detected. 4 ponds in your cluster show Ich within 5 days. Take preventive measures immediately."
}
```

### 12.5 POST /translate

**Request:**
```json
{
  "text": "Ich (White Spot Disease) detected with 87% confidence.",
  "target_language": "mr"
}
```

**Response:**
```json
{
  "translated_text": "Ich (पांढरा डाग रोग) 87% आत्मविश्वासाने आढळले.",
  "source_language": "en",
  "target_language": "mr"
}
```

### 12.6 GET /vets?lat={lat}&lng={lng}&radius_km={radius}

**Response:**
```json
{
  "vets": [
    { "name": "Dr. Suresh Patil - Govt. Fisheries Office", "type": "government", "distance_km": 4.2, "phone": "+91-2352-XXXXXX", "hours": "10am–5pm Mon–Sat", "lat": 17.0, "lng": 73.3 }
  ]
}
```

### 12.7 Error Response Format

```json
{
  "error": true,
  "code": "INVALID_IMAGE",
  "message": "Uploaded file is not a valid image or exceeds 10MB limit.",
  "suggestion": "Please upload a JPEG, PNG, or WebP file under 10MB."
}
```

**Error Codes:** `INVALID_IMAGE`, `MODEL_TIMEOUT`, `TRANSLATION_FAILED`, `POND_NOT_FOUND`, `RATE_LIMIT_EXCEEDED`

---

## 13. Database Schema

### 13.1 Firebase Firestore Collections

#### Collection: `diagnoses`

```
diagnoses/{diagnosis_id}
├── diagnosis_id: string
├── timestamp: timestamp
├── user_id: string (nullable, anonymous)
├── pond_id: string
├── primary_disease: string
├── confidence: float
├── severity: string ["Mild"|"Moderate"|"Critical"]
├── top_predictions: array[{disease, confidence}]
├── heatmap_stored: boolean
├── fish_count: integer
├── economic_loss_inr: float
├── location: geopoint
├── synced_from_offline: boolean
└── language: string
```

#### Collection: `ponds`

```
ponds/{pond_id}
├── pond_id: string
├── user_id: string
├── name: string
├── location: geopoint
├── area_hectares: float
├── primary_species: string
├── stock_count: integer
├── created_at: timestamp
├── risk_score: integer (0–100)
├── risk_level: string ["Safe"|"Warning"|"Critical"]
└── last_updated: timestamp
```

#### Collection: `users`

```
users/{user_id}
├── user_id: string
├── telegram_chat_id: string (nullable)
├── preferred_language: string
├── location: geopoint
└── created_at: timestamp
```

#### Collection: `case_database` (for similarity search)

```
case_database/{case_id}
├── case_id: string
├── disease: string
├── severity: string
├── image_path: string
├── feature_vector_b64: string (numpy float32 → base64)
├── outcome: string
├── verified: boolean
└── source: string ["ICAR"|"Kaggle"|"User-contributed"]
```

#### Collection: `outbreak_alerts`

```
outbreak_alerts/{alert_id}
├── alert_id: string
├── zone_geohash: string
├── disease: string
├── outbreak_risk_score: integer
├── affected_pond_ids: array[string]
├── created_at: timestamp
├── notified: boolean
└── resolved: boolean
```

### 13.2 SQLite Schema (Offline Fallback)

```sql
CREATE TABLE offline_diagnoses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    local_id TEXT UNIQUE NOT NULL,
    image_b64 TEXT NOT NULL,
    primary_disease TEXT,
    confidence REAL,
    severity TEXT,
    pond_id TEXT,
    timestamp TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    sync_diagnosis_id TEXT
);

CREATE TABLE ponds_local (
    pond_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    species TEXT,
    stock_count INTEGER,
    last_risk_score INTEGER,
    last_updated TEXT
);

CREATE TABLE case_vectors (
    case_id TEXT PRIMARY KEY,
    disease TEXT NOT NULL,
    feature_vector BLOB NOT NULL,
    outcome TEXT,
    image_path TEXT
);
```

---

## 14. Integration Details

### 14.1 Telegram Bot Integration

**Setup:**
1. Create bot via @BotFather → receive `BOT_TOKEN`
2. Store `BOT_TOKEN` in Flask `.env`; never expose to frontend
3. Farmer links account by messaging the bot `/start` → bot stores `chat_id` in Firestore

**Webhook Flow:**
```
POST https://api.telegram.org/bot{BOT_TOKEN}/setWebhook
→ Flask endpoint: /webhook/telegram
→ Handle incoming commands: /diagnose, /report, /pondstatus, /alert
```

**Report Message Format:**
```
🐟 AquaDetect AI Diagnosis Report
━━━━━━━━━━━━━━━━━━━
🦠 Disease: Ich (White Spot Disease)
📊 Confidence: 87% | Severity: ⚠️ Moderate
━━━━━━━━━━━━━━━━━━━
🔍 Reasoning: Detected due to white spots, fin damage
💊 Treatment: Salt Bath + Malachite Green
📅 Start Today — See day-wise plan
💰 Loss if Untreated (14 days): ₹2,70,000
✅ Treatment Cost: ₹1,200
━━━━━━━━━━━━━━━━━━━
[Heatmap image attached]
📍 Nearest Vet: Dr. Suresh Patil — 4.2km
```

### 14.2 Leaflet.js (Vet Locator Map)

- Loaded via CDN: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` (free, OSS)
- Base tile layer: OpenStreetMap (free, no API key required)
- Geolocation: `navigator.geolocation.getCurrentPosition()`
- Vet data: Served from Flask `/api/vets` endpoint backed by Firestore
- Custom markers: SVG icons differentiated by vet type
- Clustering: Leaflet.markercluster plugin for dense urban areas

### 14.3 LibreTranslate / Bhashini API

**Primary: Bhashini API (Government of India)**
- Free for Indian language NLP under Digital India initiative
- Supports: Hindi, Marathi, Tamil, Telugu, Bengali, Kannada, Odia, Malayalam
- Registration required at bhashini.gov.in (free)
- REST endpoint: `POST https://dhruva-api.bhashini.gov.in/services/inference/pipeline`

**Fallback: LibreTranslate (self-hosted)**
```bash
docker run -p 5001:5000 libretranslate/libretranslate
```
- Fully open-source, no API key, no rate limits when self-hosted
- Supports major Indian languages via Helsinki-NLP/opus-mt models

**Translation Strategy:**
- Static UI strings: pre-translated, loaded at build time (i18next JSON files)
- Dynamic content (diagnosis, treatment text): real-time API call, cached by disease+language key

### 14.4 Web Speech API (Voice Chatbot)

```javascript
// Speech-to-Text
const recognition = new webkitSpeechRecognition();
recognition.lang = 'mr-IN'; // Marathi; dynamically set from language preference
recognition.onresult = (e) => { processVoiceInput(e.results[0][0].transcript); };

// Text-to-Speech
const utter = new SpeechSynthesisUtterance(responseText);
utter.lang = 'mr-IN';
window.speechSynthesis.speak(utter);
```

- No API key or cost involved — browser-native API
- Supported in Chrome (mobile and desktop), Edge; limited in Firefox
- Graceful degradation: text input fallback shown if browser does not support

### 14.5 TensorFlow.js (Offline Engine)

```javascript
// Load model (cached in IndexedDB after first load)
const model = await tf.loadLayersModel('indexeddb://aquadetect-mobilenetv2');

// Inference
const imgTensor = tf.browser.fromPixels(imgElement)
  .resizeNearestNeighbor([224, 224])
  .toFloat().div(255.0).expandDims(0);
const preds = model.predict(imgTensor);
const top1 = preds.argMax(-1).dataSync()[0];
```

- Model pre-loaded on first online visit and cached in IndexedDB
- Service Worker intercepts `/api/diagnose` calls when offline → routes to TF.js

---

## 15. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Model accuracy below 85% on unseen data | Medium | High | Augment dataset; use ensemble of MobileNetV2 + fallback rule-based checks |
| Dataset too small / class imbalance | High | High | Synthetic augmentation; SMOTE for underrepresented classes; oversample rare diseases |
| Bhashini API downtime | Low | Medium | LibreTranslate self-hosted fallback; pre-cache translations for top diseases |
| Telegram Bot API rate limiting | Low | Low | Queue messages; retry with exponential backoff |
| Browser Web Speech API not supported | Medium | Medium | Show text input fallback; display warning to unsupported browser users |
| TF.js offline model performance gap vs server model | High | Medium | Clearly label offline results as "Preliminary — sync for full analysis" |
| Firebase Firestore free tier quota exceeded | Low (demo scale) | Medium | Add SQLite as write-through cache; monitor quota; demo with <100 records |
| YOLOv8 bounding box inaccurate on low-res phone images | Medium | Medium | Set minimum resolution requirement (≥480px); fallback to Grad-CAM only |
| Leaflet.js map lacks vet data for rural areas | High | Medium | Seed with government fisheries office locations from public ICAR directories |
| Farmer data privacy concerns | Low | High | Anonymize all images; no mandatory login; opt-in case database contribution |

---

## 16. Limitations

1. **Model Scope:** Trained on 30 disease classes. Rare diseases, regional species variants, or unusual presentations may not be accurately classified.

2. **Image Quality Dependency:** Blurry, poorly lit, or partial fish images significantly reduce confidence. System prompts user to retake if quality is below threshold.

3. **Offline Mode Reduced Accuracy:** The quantized TF.js model sacrifices ~5–8% accuracy vs the full server-side MobileNetV2. Heatmap and bounding box are unavailable offline.

4. **Economic Estimates are Approximations:** Loss projections use average market price defaults. Real losses depend on local market fluctuations, species-specific mortality curves, and intervention timing.

5. **Progression Simulator is Knowledge-Based, Not Predictive:** Stages are curated from literature, not individually modeled per fish/pond. Actual progression may differ.

6. **Outbreak Prediction is Rule-Based (v1):** The MVP uses frequency thresholds rather than a trained LSTM. Predictive accuracy improves with more historical data.

7. **Voice Recognition Language Support:** Web Speech API quality for regional Indian languages (especially Odia, Malayalam) varies by Android device OEM voice model. Some dialects may not be recognized.

8. **Vet Data Completeness:** The vet locator database is seeded from public directories and may not include all private practitioners. A crowdsourced update mechanism is planned for v2.

9. **No Real-Time Water Quality Input:** The system does not integrate with IoT sensors; environmental context is inferred from user input or defaults, not live sensor data.

10. **Not a Medical Device:** AquaDetect AI is a decision-support tool. It is not a substitute for professional aquaculture veterinary diagnosis. This is stated prominently in the UI and all generated reports.

---

## 17. Future Scope

### Phase 2 (Post-Hackathon: 3–6 months)

| Feature | Description |
|---|---|
| IoT Sensor Integration | Connect with dissolved oxygen, pH, temperature sensors (Arduino/ESP32) for real-time pond environment data feeding into risk scores |
| LSTM Outbreak Forecasting | Replace rule-based outbreak predictor with LSTM model trained on temporal disease incidence data |
| Drone Image Analysis | Accept aerial pond images for mass disease surveillance across large fish farms |
| WhatsApp Bot | Extend report delivery to WhatsApp Business API (free tier for NGOs) |
| Community Disease Map | Public-facing geospatial dashboard showing anonymized disease hotspots — for government surveillance use |

### Phase 3 (6–12 months)

| Feature | Description |
|---|---|
| ML-Based Treatment Efficacy Tracking | Learn which treatments work in which regions by tracking reported outcomes; personalize recommendations |
| Insurance Integration | Partner with crop/livestock insurance APIs to auto-generate loss documentation for claims |
| Marketplace Module | Connect farmers with verified medicine suppliers for lowest-cost local procurement |
| Shrimp & Prawn Disease Extension | Expand model to cover WSSV, EMS, and other crustacean-specific diseases |
| Government API Integration | Submit anonymized outbreak data to National Fisheries Development Board APIs |

### Phase 4 (12+ months)

| Feature | Description |
|---|---|
| Edge AI Device | Package model on Raspberry Pi 4 as a dedicated on-pond diagnosis terminal |
| Federated Learning | Train global model improvements from on-device data without centralizing sensitive images |
| Clinical-Grade Validation | Partner with ICAR-CIFE for clinical validation study; pursue regulatory advisory acknowledgement |

---

## 18. Success Metrics

### 18.1 Technical KPIs

| Metric | Target |
|---|---|
| Top-1 Disease Classification Accuracy | ≥85% on test set |
| API Response Time (P95) | ≤3 seconds |
| Offline Model Accuracy | ≥77% (within 8% of online model) |
| Grad-CAM Fidelity Score | ≥0.75 (Pointing Game metric) |
| Similarity Search Precision@3 | ≥80% (same disease in top-3) |
| System Uptime (demo) | 99% |

### 18.2 User Impact KPIs

| Metric | Target (6 months post-launch) |
|---|---|
| Farmers onboarded | 500+ |
| Diagnoses performed | 5,000+ |
| Average time-to-diagnosis | <60 seconds |
| User satisfaction (in-app rating) | ≥4.2/5.0 |
| Treatment adherence (Day-7 check-in rate) | ≥60% of users who start a plan |
| Reported recovery rate | ≥70% of treated diagnoses |
| Average economic saving per treated case | ≥₹50,000 |
| Outbreak alerts issued | ≥10 verified alerts preventing spread |

### 18.3 Hackathon Judging Metrics (Internal)

| Judging Criterion | Our Differentiator |
|---|---|
| Innovation | Economic Loss Predictor + Action Timeline Generator are novel in aquaculture AI |
| Technical Depth | End-to-end AI pipeline: detection → explainability → similarity → prediction |
| Social Impact | Targets 2.8 crore Indian fish farmers; free, offline-capable, multilingual |
| Completeness | 16 features, full API, schema, architecture, demo — all working |
| Explainability | Grad-CAM + NL reasoning + Trust Meter — sets new benchmark for agricultural AI |
| Feasibility | All tools free/open-source; full demo achievable in 48h development |

---

## 19. Demo Flow

### 19.1 Recommended Hackathon Demo Script (7 minutes)

**Minute 0–1: Problem Hook**
> Show a 30-second real clip of fish disease outbreak footage. State: "Indian fish farmers lose ₹8,000 crore annually to preventable diseases. Current tools give a disease name. That's not enough."

**Minute 1–2: Upload & Instant Diagnosis**
1. Open AquaDetect AI on mobile screen (mirrored).
2. Tap "Diagnose Now" → upload a pre-staged fish photo showing Ich.
3. Wait 2.5 seconds → Diagnosis Card appears: *"Ich (White Spot Disease) — 87% confident — Moderate Severity"*
4. Point to Trust Meter: *"We don't just give an answer — we tell you how sure we are."*

**Minute 2–3: Explainability Showcase**
1. Toggle heatmap overlay: show red region over white spots on fish.
2. Read the reasoning aloud: *"Detected due to white circular spots across body surface, scale lifting at dorsal fin..."*
3. Say: *"This is Explainable AI. The farmer knows WHY the AI said this. That builds trust."*

**Minute 3–4: Economic Loss + Action Timeline**
1. Enter: Fish Count = 5,000 | Avg Weight = 0.5kg | Market Price = ₹120/kg
2. Show the Economic Dashboard animating: *"₹2,70,000 lost if untreated in 14 days. Treatment cost: ₹1,200."*
3. Click "Action Timeline": scroll through Day 1, Day 2... *"Step-by-step, day by day — like a treatment GPS."*

**Minute 4–5: Outbreak Prediction + Pond Risk**
1. Switch to Pond Risk Dashboard: show 3 ponds — 1 Safe (green), 1 Warning (amber), 1 Critical (red).
2. Click Outbreak Map tab: show zone alert badge over a cluster.
3. Say: *"The system detected 4 ponds in 10km with the same disease in 5 days. It raises an outbreak alert before it becomes a catastrophe."*

**Minute 5–6: Multilingual Voice + Telegram**
1. Switch language to Marathi — full UI translates.
2. Tap microphone, speak in Marathi: *"माझ्या माशाचा आजार काय आहे?"* → diagnosis reads back in Marathi.
3. Tap "Send to Telegram" → show phone receiving formatted diagnosis report with heatmap image instantly.

**Minute 6–7: Offline Mode + Closing**
1. Toggle phone to Airplane Mode.
2. Upload a new fish photo — diagnosis still works in <5s.
3. Show "Offline Mode" banner + queued sync indicator.
4. Closing line: *"AquaDetect AI is not a chatbot. It's not a label printer. It's a complete aquaculture intelligence partner — explainable, affordable, offline-ready, and built for India."*

### 19.2 Fallback Plan

If live demo faces connectivity issues:
- Pre-recorded 3-minute screen-capture video of all features
- Static screenshots embedded in slide deck
- Offline mode demo requires no internet — always works as fallback

### 19.3 Demo Dataset Preparation

Pre-stage the following for the demo:
- 5 test fish images (Ich, Fin Rot, Bacterial Gill Disease, EUS, Healthy) — high quality, clear photos
- 3 registered ponds in Firebase with seeded diagnosis history
- 1 Telegram bot linked to demo device
- Vet locator seeded with 10 mock vets near demo GPS location
- Outbreak scenario seeded: 4 ponds with Ich in 10km cluster

---

## Appendix A: Tech Stack Summary

| Layer | Technology | Version | License |
|---|---|---|---|
| Frontend Framework | React (Vite) | 5.x | MIT |
| UI Components | shadcn/ui + Tailwind CSS | Latest | MIT |
| Charts | Recharts | 2.x | MIT |
| Maps | Leaflet.js | 1.9.4 | BSD-2 |
| Voice | Web Speech API | Browser-native | W3C Standard |
| i18n | i18next | 23.x | MIT |
| Backend | Python Flask | 3.x | BSD |
| AI Framework | TensorFlow / Keras | 2.15 | Apache-2.0 |
| Object Detection | Ultralytics YOLOv8 | 8.x | AGPL-3.0 |
| Browser AI | TensorFlow.js | 4.x | Apache-2.0 |
| Primary Database | Firebase Firestore | Spark (Free) | Proprietary (free tier) |
| Offline Database | SQLite | 3.x | Public Domain |
| Translation | Bhashini API / LibreTranslate | Latest | GOI Free / MIT |
| Telegram | Telegram Bot API | Latest | Free |
| Containerization | Docker (optional) | 24.x | Apache-2.0 |

---

## Appendix B: Project File Structure

```
aquadetect-ai/
├── frontend/                    # React Vite Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── DiagnosisCard/
│   │   │   ├── HeatmapViewer/
│   │   │   ├── TrustMeter/
│   │   │   ├── TreatmentPanel/
│   │   │   ├── TimelineView/
│   │   │   ├── EconomicDashboard/
│   │   │   ├── ProgressionSimulator/
│   │   │   ├── SimilarCasesPanel/
│   │   │   ├── PondRiskDashboard/
│   │   │   ├── VetLocatorMap/
│   │   │   ├── VoiceChatbot/
│   │   │   └── OutbreakAlert/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── DiagnosisResult.jsx
│   │   │   ├── MyPonds.jsx
│   │   │   ├── OutbreakMap.jsx
│   │   │   ├── VetLocator.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── offlineEngine.js
│   │   │   ├── telegramService.js
│   │   │   └── translationService.js
│   │   ├── hooks/
│   │   │   ├── useVoice.js
│   │   │   ├── useOffline.js
│   │   │   └── usePondRisk.js
│   │   ├── locales/             # i18n JSON files (8 languages)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   ├── tf-model/           # TensorFlow.js model files
│   │   └── sw.js               # Service Worker
│   └── vite.config.js
│
├── backend/                     # Python Flask API
│   ├── app.py                   # Flask app entry point
│   ├── config.py
│   ├── .env                     # BOT_TOKEN, Firebase config
│   ├── ai/
│   │   ├── classifier.py        # MobileNetV2 inference
│   │   ├── detector.py          # YOLOv8 bounding box
│   │   ├── gradcam.py           # Grad-CAM heatmap
│   │   └── similarity.py        # Feature embedding + cosine search
│   ├── modules/
│   │   ├── economics.py
│   │   ├── timeline.py
│   │   ├── outbreak.py
│   │   └── pond_risk.py
│   ├── integrations/
│   │   ├── telegram_bot.py
│   │   └── translator.py
│   ├── data/
│   │   ├── knowledge_base.json  # Disease info, causes, treatment
│   │   ├── case_vectors.db      # SQLite case embeddings
│   │   └── vets_seed.json       # Vet location seed data
│   ├── models/
│   │   ├── mobilenetv2_fish.h5  # Trained classifier
│   │   └── yolov8n_fish.pt      # Trained detector
│   └── requirements.txt
│
├── training/                    # ML Training Scripts
│   ├── train_classifier.py
│   ├── train_detector.py
│   ├── prepare_dataset.py
│   └── export_tfjs.py           # Convert Keras → TF.js
│
├── docker-compose.yml
└── README.md
```

---

*Document End — AquaDetect AI PRD v1.0.0*  
*Prepared for Hackathon Submission | All tools and APIs referenced are free and open-source*  
*"Smarter fish farming starts with explainable AI."* 🐟
