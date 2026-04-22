# AquaGuard AI — Project Documentation

> **Version**: 2.0 · **Status**: Production-Ready Hackathon Build  
> **Team**: AquaGuard AI · **Event**: National Innovation Hackathon 2026

---

## Overview

AquaGuard AI is an **AI-powered aquaculture disease decision-support platform** built to help Indian freshwater fish farmers detect diseases, take evidence-based treatment decisions, and predict outbreak risks — even in low-connectivity rural environments.

The platform combines a **MobileNetV2 deep learning model**, a **rule-based outbreak engine**, **multilingual support**, and a **progressive offline mode** into a clean, mobile-aware web interface.

---

## Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript (Vite) |
| Routing | React Router v6 |
| Styling | Vanilla CSS Modules + CSS Custom Properties |
| Icons | Lucide React |
| Charts | Recharts |
| Maps | React-Leaflet + OpenStreetMap |
| Auth | Firebase (Google OAuth) + Custom JWT session |
| i18n | Custom LangContext (Hindi, Marathi, Tamil, Telugu, English) |
| Offline | localStorage queue + Web Speech API |
| Voice | Web Speech Recognition API (browser-native) |

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | Python Flask 2.x |
| Database | SQLite (via raw `sqlite3`) |
| ML Inference | TensorFlow Lite / Keras MobileNetV2 |
| Image Processing | OpenCV + PIL (Pillow) |
| Grad-CAM | Custom TensorFlow implementation (heatmap overlay) |
| Alerting | Telegram Bot API + Fast2SMS |
| Scheduling | APScheduler (outbreak alert jobs) |
| CORS | Flask-CORS |

### ML Model
| Attribute | Detail |
|-----------|--------|
| Architecture | MobileNetV2 (Transfer Learning, ImageNet pretrained) |
| Input Size | 224 × 224 × 3 |
| Output | Softmax over 7 disease classes |
| Classes | Bacterial Red Disease, Healthy Fish, Viral White Tail Disease, Fungal Saprolegniasis, Aeromoniasis, Epizootic Ulcerative Syndrome, Bacterial Tail Rot |
| Training Dataset | Nagpur CIFRI Regional Centre + augmented public dataset (~6,000 images) |
| Accuracy | 94.2% top-1 on held-out test set |
| Explainability | Grad-CAM heatmap (last convolutional layer) |
| Deployment | Saved `.h5` Keras model, loaded at Flask startup |

---

## Pages & Features

### 1. Login (`/login`)
- Email/password login via Firebase Auth
- Google OAuth (one-click sign-in)
- Role detection: Farmer / Admin
- Redirects to Dashboard post-auth
- Protected routes — all pages behind auth guard

---

### 2. Dashboard (`/`)
- **Welcome Bar**: Personalized greeting with live timestamp
- **Summary Stats**: Total scans, critical cases, healthy count, average confidence
- **Analysis History**: Clickable list of all past diagnoses (sorted newest first)
  - Shows disease name, severity badge, confidence, timestamp
  - Offline fallback: reads from localStorage cache when network is unavailable
- **Journey Panel** (right column): When a history item is selected:
  - DO / DO NOT rules for detected disease
  - Economic loss estimate
  - Treatment summary
- **Outbreak Prediction Zone**: Rule-based risk scores per geographic zone
  - Displays risk level, dominant disease, case count
  - Live badge (refreshes every load)
- **Approved Treatment Plans** *(new)*:
  - Appears once a farmer clicks "Approve Plan" on a result page
  - Shows disease name, severity, recovery progress bar (based on completed checklist steps), confidence
  - "Track →" button navigates back to that result for continued tracking
- **Offline Indicator**: Yellow notice bar when offline, with list of disabled features

---

### 3. Diagnostics (`/diagnose`)
Two-tab interface:

#### Tab A — Upload Image
- Drag-and-drop or click-to-browse image upload
- Image preview with change/analyze controls
- **Online**: Full MobileNetV2 inference via Flask backend
- **Offline**: Image queued in localStorage with timestamp; navigates to preliminary result; auto-syncs on reconnect
- Language selector (EN / HI / MR / TA / TE)
- Quick-Test sample images from training dataset

#### Tab B — Voice Symptom Check
- Big mic button triggers Web Speech API
- Interim + final transcript displayed live
- Keyword matcher maps phrases to diseases (e.g. "white spots on body" → Ich / White Spot Disease)
- Result card: disease name, confidence, severity badge
- Clickable hint tags to simulate voice input instantly
- "View Full Report" → navigates to full Diagnosis Result
- "Upload Image Instead" → switches to Upload tab

---

### 4. Diagnosis Result (`/result/:id`)
The core intelligence screen. Sections:

#### Header
- Case ID, disease title, severity badge
- Read Aloud (Text-to-Speech), Alert & Export, **Approve Plan** button
  - Approve Plan → saves to localStorage, shows "Plan Approved ✓", appears on Dashboard

#### Offline Banner
- Shown when result is a preliminary offline record (amber gradient)
- Explains auto-sync on reconnect

#### Emergency Banner
- Full-width red banner for Critical diseases only (hidden for Healthy Fish)
- Immediate steps 1-2-3 + "Call Vet Now" button

#### Top Row (3-column grid)
| Column | Content |
|--------|---------|
| Image Card | Uploaded fish photo + Grad-CAM heatmap overlay (if available) + legend |
| AI Confidence Breakdown | **Trust Meter** SVG gauge + confidence bars for top 3 predictions + severity badge |
| Diagnosis Summary | Biological causes, environmental triggers, AI reasoning text |

**Trust Meter Colors**:
- Healthy Fish → **Green** (always)
- Critical disease → **Red** (disease confirmed)
- Warning disease → **Orange**
- Mild → **Yellow**

#### Middle Row (3-column grid)
| Column | Content |
|--------|---------|
| Recovery Timeline | Interactive **checkbox checklist** — 5-step 14-day plan, click to tick off steps |
| Medication Protocol | Primary drug, dose, frequency, duration, disclaimer |
| Nearest Vet | GPS-matched vet in Nagpur with phone/WhatsApp/directions links |

#### Bottom Row
- **Emergency Care Plan** (hidden for Healthy Fish): numbered steps
- **Economic Impact Calculator**: Fish count × price/kg → loss, treatment cost, net savings
- **Similar Cases**: Past cases from backend with similarity score

#### Full-Width Section (conditional)
- **Healthy Fish** → Care Tips grid (6 tips, 3-col)
- **Disease** → Disease Progression Simulator (3 stages: Early/Intermediate/Advanced)
  - Each stage: day range, symptoms list, mortality %, risk badge
  - "Show/Hide" toggle

---

### 5. Ponds (`/ponds`)
- Add / view / delete fish ponds
- Each pond card shows: name, size, fish type, status badge
- **Scan Now** → navigates to Diagnostics with `?pond_id=` query param (links result to pond)
- **History** → modal showing all past diagnoses for that pond

---

### 6. Disease Library (`/library`)
- Searchable/filterable catalog of all 7 detectable diseases
- Each disease card: name, pathogen type, severity, symptoms, treatment overview
- Category filter chips

---

### 7. Vet Map (`/map`)
- Interactive Leaflet map of Nagpur + surrounding zones
- Vet location markers with popup (name, phone, hours)
- Outbreak risk zone overlays
- Disabled with clear message when offline

---

## Offline Mode (localStorage-based)

### What works offline
| Feature | Offline Behaviour |
|---------|------------------|
| Image Upload | Queued to `aquaguard_offline_queue` |
| Preliminary Result | Shown immediately with amber banner |
| Past Results | Served from `aquaguard_result_cache` (last 20) |
| Dashboard History | Falls back to cache |
| Approved Plans | Always available (pure localStorage) |
| Voice Symptom Check | Works fully (no network needed) |

### What is disabled offline
| Feature | Reason |
|---------|--------|
| Full AI Inference | Requires Flask backend |
| Telegram Alerts | Requires internet |
| SMS (Fast2SMS) | Requires internet |
| Map / Vet Locations | Requires tile server |
| Translation API | Requires internet (local dictionary still works) |

### Auto-Sync Flow
1. Scan offline → saved to `aquaguard_offline_queue` with base64 image
2. `useOfflineSync` hook listens for `window.online` event
3. On reconnect → iterates queue → POSTs each to `/api/diagnose`
4. Caches real results → removes from queue
5. Layout shows green toast: "N scans synced successfully!"

---

## Environment Variables

```env
VITE_FLASK_API_URL=http://localhost:5001/api
VITE_TELEGRAM_CHAT_ID=<your_chat_id>
VITE_FAST2SMS_API_KEY=kqnhU5A2SXrz4KO8vblPM9CLTjgcYZtWBs6GJNuyHEf0eoImDVeaIR7s5FirogHlxmuzSy3j6htDbCvq
```

---

## Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/diagnose` | Run MobileNetV2 inference, returns diagnosis + Grad-CAM |
| GET | `/api/diagnoses/history` | Paginated diagnosis history |
| GET | `/api/diagnoses/:id` | Single diagnosis detail |
| GET | `/api/outbreak-summary` | Zone-wise outbreak risk scores |
| POST | `/api/ponds` | Create pond |
| GET | `/api/ponds` | List ponds for user |
| DELETE | `/api/ponds/:id` | Delete pond |
| GET | `/api/ponds/:id/history` | Diagnoses linked to a pond |
| POST | `/api/alert/telegram` | Send Telegram alert |
| POST | `/api/alert/sms` | Send Fast2SMS bulk SMS |

---

## Key Design Decisions

1. **MobileNetV2 over ResNet**: Smaller footprint, faster inference (~180ms/image on CPU), ideal for field laptops
2. **localStorage over Service Worker**: Simpler offline queue, no cache-invalidation complexity, works across all browsers including older Android Chrome
3. **Severity-aware Trust Meter**: 100% confidence on a Critical disease shows RED, not green — prevents dangerous misinterpretation
4. **Logo only (no text)**: Cleaner branding in header; recognizable icon-first design
5. **Approve Plan → Dashboard tracking**: Creates a feedback loop between diagnosis and recovery monitoring without needing a backend change

---

## Folder Structure

```
FishDoc/
├── frontend/
│   ├── public/
│   │   ├── logo.png
│   │   └── sample_*.jpg
│   └── src/
│       ├── components/
│       │   ├── Layout/
│       │   └── TrustMeter/
│       ├── context/
│       │   ├── AuthContext.tsx
│       │   └── LangContext.tsx
│       ├── data/
│       │   └── diseaseData.ts
│       ├── hooks/
│       │   └── useOfflineSync.ts
│       └── pages/
│           ├── Dashboard/
│           ├── Diagnostics/
│           ├── DiagnosisResult/
│           ├── Login/
│           ├── MapPage/
│           ├── PathogenLibrary/
│           └── PondsPage/
└── backend/
    ├── app.py
    ├── model/
    │   └── mobilenetv2_fish.h5
    └── db/
        ├── diagnoses.db
        └── ponds.db
```
