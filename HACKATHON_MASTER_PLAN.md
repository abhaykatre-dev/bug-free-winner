# 🏆 HACKATHON MASTER PLAN
## AquaGuard XAI — Freshwater Fish Disease Ecosystem
### "From Detection to Ecosystem: Saving India's Aquaculture at Scale"

**Version:** 3.0 — FINAL HACKATHON STRATEGY  
**Date:** April 2026  
**Team:** keshav nabira  
**Model Asset:** `model/fish_disease_resnet50.pkl` (ResNet-50, trained, ready)  
**Backend:** Flask — fully scaffolded, all routes wired  
**Target:** First Place — Hackathon Judges  

---

## 🎯 THE WINNING FORMULA

Most teams will submit: `Image → AI → Disease label`. That is a demo, not a product.

**We submit: A living aquaculture intelligence ecosystem** — detection is just the entry point. Every feature after that compounds value. Judges score on **impact**, **completeness**, **innovation**, and **demo quality**. We win all four.

### What Separates Us

| Dimension | Others | AquaGuard XAI |
|---|---|---|
| Core AI | Image classifier | Classifier + Grad-CAM XAI + Confidence Trust Meter |
| Output | Disease name | Disease + severity + economic loss + day-wise treatment plan |
| Reach | English web app | 5 languages, voice-first, offline PWA, Telegram bot |
| Intelligence | One-time scan | Pond risk tracking + outbreak prediction + trend analytics |
| Business Impact | Undefined | Live ₹ loss calculator shown to farmer in real-time |
| Trust | Black-box | Explainable AI — heatmap shows WHY the diagnosis was made |
| Demo Power | Slides | Live camera scan → full report in under 3 seconds |

---

## 🧠 THE ECOSYSTEM VISION

```
                    ┌─────────────────────────────────────────────────┐
                    │            THE AQUAGUARD ECOSYSTEM               │
                    │                                                   │
                    │  DETECT → EXPLAIN → TREAT → TRACK → PREVENT     │
                    └─────────────────────────────────────────────────┘

DETECT          → Upload fish photo / use live camera
                  ResNet-50 classifies 7 disease classes instantly

EXPLAIN         → Grad-CAM heatmap highlights infected region
                  "Detected due to hemorrhagic spots on dorsal fin"
                  Trust Meter: High / Medium / Low confidence

TREAT           → Specific medicine + dosage (India-specific, low cost)
                  Day 0–14 Action Timeline ("Do this each morning")
                  Cost: ₹80 treatment vs ₹1,15,000 loss if delayed 7 days

TRACK           → Pond Risk Score: Safe / Warning / Critical
                  Historical detection graph per pond
                  Disease progression simulator (Stage 1–4)

PREVENT         → Smart Outbreak Prediction
                  "3 Aeromoniasis cases in your district — isolate now"
                  FCM push + Telegram alert

CONNECT         → Nearest vet locator (Leaflet.js + OpenStreetMap, free)
                  Expert escalation when AI confidence < 70%
                  Telegram report delivery (one tap)

ACCESS          → Voice-first UI (speak in Telugu, Hindi, Bengali)
                  Offline mode — works without internet via ONNX
                  5 regional languages supported
```

---

## 📦 WHAT WE ALREADY HAVE (Do NOT Rebuild)

### ✅ Model (READY)
- `model/fish_disease_resnet50.pkl` — ResNet-50, 7 disease classes, trained
- Classes: Healthy Fish, Bacterial Red Disease, Bacterial Gill Disease, Aeromoniasis, Saprolegniasis, Parasitic Diseases, White Tail Disease
- **Action needed:** Wire `.pkl` → ONNX export OR load directly with `torch` in backend

### ✅ Backend Flask (SCAFFOLDED — All 10 Routes Exist)
- `/api/v1/detect` — image URL inference
- `/api/diagnose` — base64 image inference with SQLite persistence
- `/api/v1/explain` — Grad-CAM XAI
- `/api/v1/economic-loss` — loss calculator
- `/api/v1/action-timeline` — day-by-day plan
- `/api/v1/pond-risk/{id}` — pond health score
- `/api/v1/outbreak-predict` — outbreak intelligence
- `/api/v1/similarity` — cosine similarity search
- `/api/v1/translate` — multilingual
- `/api/v1/telegram` — Telegram bot integration
- SQLite persistence (`db/sqlite.py`) already wired
- Auth, CORS, rate limiting, error handling — all done

### ✅ Planning Docs (DONE — Do NOT Rewrite)
- `AquaGuard_PRD.md` — full product requirements
- `AquaGuard_DESIGN.md` — UI/UX system (biopunk aesthetic)
- `AquaGuard_SKILLS.md` — code references, hooks, components
- `AquaGuard_WORKFLOW.md` — all end-to-end flows

---

## 🚀 WHAT WE NEED TO BUILD — PRIORITY ORDER

### PHASE 1 — CORE WORKING DEMO (Hours 1–8)
**Goal: A judge can scan a fish photo and get a full report. This MUST work.**

#### 1.1 Wire the Real Model to the Backend
```
backend/ml/runtime.py currently expects an ONNX model.
Our model is a ResNet-50 pickle (PyTorch).

OPTION A (Fastest): Convert to ONNX once
  python -c "
    import torch, pickle
    model = pickle.load(open('model/fish_disease_resnet50.pkl', 'rb'))
    dummy = torch.randn(1, 3, 224, 224)
    torch.onnx.export(model, dummy, 'backend/models/fish_disease.onnx',
                      opset_version=11, input_names=['input'],
                      output_names=['output'])
  "
  Then set ONNX_MODEL_PATH=backend/models/fish_disease.onnx in .env

OPTION B (Direct): Load .pkl in runtime.py with torch
  Replace ModelRuntime.predict_proba() to use torch.load() directly
```

#### 1.2 Connect Grad-CAM to the Real Model
- `backend/ml/xai.py` currently generates a dummy saliency map
- Must be replaced with real Grad-CAM using the ResNet-50 last conv layer
- Layer name to hook: `layer4` (standard ResNet-50 final conv block)

```python
# Real Grad-CAM for ResNet-50
def generate_gradcam(model, image_tensor, class_idx):
    gradients = []
    activations = []
    
    def forward_hook(module, input, output):
        activations.append(output)
    def backward_hook(module, grad_in, grad_out):
        gradients.append(grad_out[0])
    
    handle_f = model.layer4.register_forward_hook(forward_hook)
    handle_b = model.layer4.register_backward_hook(backward_hook)
    
    output = model(image_tensor)
    model.zero_grad()
    output[0, class_idx].backward()
    
    handle_f.remove()
    handle_b.remove()
    
    grads = gradients[0].cpu().data.numpy()
    acts  = activations[0].cpu().data.numpy()
    weights = grads.mean(axis=(2, 3), keepdims=True)
    cam = (weights * acts).sum(axis=1, keepdims=False)
    cam = np.maximum(cam, 0)
    cam = cam[0]  # (H, W)
    cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
    return cam  # normalize to [0,1], then resize to 224×224 and overlay
```

#### 1.3 Replace api_prd.py Placeholder Logic
- `api_prd.py` POST /diagnose currently uses random scores → Replace with real model inference
- Connect to `ModelRuntime.predict_proba()` and real Grad-CAM

#### 1.4 Populate the Disease Knowledge Base
File: `backend/data/disease_info.py` — verify all 7 classes have complete data:
- Treatment medicines (India-specific, with cost)
- Causes (environmental + biological)
- Severity mapping
- Reasoning text
- Urgency: healthy / monitor / treat / isolate

#### 1.5 Build the Frontend (React Vite PWA)
See `AquaGuard_SKILLS.md` for complete component tree. Priority screens for demo:
1. **Login screen** — Phone OTP or Google OAuth (Firebase)
2. **Scan screen** — Camera capture + file upload + pond selector
3. **XAI Report screen** — The money shot (heatmap + disease + urgency + trust meter)
4. **Economic Panel** — Loss calculator with bar chart
5. **Action Timeline** — Day 0–14 treatment plan
6. **Home Dashboard** — Pond cards + risk badges

---

### PHASE 2 — ECOSYSTEM DIFFERENTIATORS (Hours 9–16)
**Goal: Features that no other team has. These win the hackathon.**

#### 2.1 Live Economic Loss Shock Mechanism (HIGHEST IMPACT)
The single most powerful demo moment. When farmer enters fish count and market price, show:

```
┌────────────────────────────────────────────┐
│  💰 Economic Impact Projection             │
│                                            │
│  Fish: 5,000 | Price: ₹120/kg             │
│                                            │
│  ✅ Treat TODAY:    ₹    120 (medicine)   │
│  ⚠️  Wait 3 days:   ₹  63,000 (lost fish) │
│  🔴 Wait 7 days:   ₹1,15,500 (lost fish) │
│  💀 Wait 14 days:  ₹1,57,500 (lost fish) │
│                                            │
│  [bar chart animates to show escalation]  │
│                                            │
│  Every hour of delay = ₹187 lost.         │
└────────────────────────────────────────────┘
```

**Why this wins:** Judges will say "this changes behavior — it makes farmers act." No other team will show a real-time ₹ loss counter.

#### 2.2 Grad-CAM Heatmap with Annotation (VISUAL SHOWSTOPPER)
- Overlay heatmap on original fish image
- Draw bounding box around highest-activation region
- Label: "Infected Region — Dorsal fin discoloration (72% activation)"
- Side-by-side: Original vs Heatmap

This is the "wow" moment in the demo. Judges will lean forward.

#### 2.3 Disease Progression Simulator
Visual timeline showing what happens if farmer does nothing:

```
Stage 1 (Day 0)  →  Stage 2 (Day 3)  →  Stage 3 (Day 7)  →  Stage 4 (Day 14)
Mild symptoms       Spreading          Severe ulcers       Pond mortality
5% dead             30% dead           55% dead             75% dead
```

Animated with progress indicators and mortality % labels.

#### 2.4 Smart Outbreak Prediction Dashboard
- Admin / expert view showing regional disease trends on a map
- Cluster detection: "5 Aeromoniasis cases in 10km radius in 7 days"
- Color-coded: Green → Yellow → Red zones
- Uses SQLite historical detections + haversine clustering (already in api_prd.py)

#### 2.5 Pond Risk Score System
Each pond gets a dynamic health score (0–100):
- Aggregates last 7/30 days of detections
- Classifies: Safe (>75) / Warning (50–75) / Critical (<50)
- Shows trend arrow: improving ↑ / stable → / declining ↓
- Dashboard card with animated gauge

#### 2.6 Telegram Bot Integration
One-tap report delivery — the "rural accessibility" feature judges love:
- After each scan: auto-send disease name + severity + medicine + economic loss to linked Telegram
- Format: Rich Markdown message with urgency icon
- Two-way: `/scan` command sends scan reminder
- No app needed after setup — works on basic Android

#### 2.7 Voice-First Mode (Accessibility)
- Web Speech API: farmers speak in Telugu/Hindi/Bengali
- Commands: "Start scan", "Read my report", "Find nearest vet"
- TTS readout of diagnosis and treatment steps
- Floating microphone FAB (always visible)

---

### PHASE 3 — PRODUCTION POLISH (Hours 17–22)
**Goal: Demo-ready, zero errors, visually stunning.**

#### 3.1 Design System Implementation
Follow `AquaGuard_DESIGN.md` biopunk aesthetic:
- Colors: Deep-water dark (#030F0B), electric cyan (#00A3E0), bio-green (#00C896)
- Typography: Inter / Outfit from Google Fonts
- Glassmorphism cards with backdrop-filter blur
- Animated urgency banners (pulsing red for CRITICAL)
- Smooth transitions between screens (Framer Motion)
- Confidence gauge with animated fill

#### 3.2 Offline PWA
- Bundle ONNX model in Service Worker cache
- Works without internet — shows "Offline Mode" banner
- Queue detections → sync when online
- Install to home screen prompt

#### 3.3 PDF Report Export
- One-tap: download full diagnosis as PDF
- Includes: disease name, heatmap image, treatment plan, economic projection, QR code to Telegram
- No server needed — use `jsPDF` in browser
- Farmers can share with local vet or government officer

#### 3.4 Nearby Vet Locator
- Leaflet.js map (100% free, OpenStreetMap)
- Seed `backend/data/vets_seed.json` with government fisheries offices
- Filter by type: Aquaculture Specialist / General Vet / Govt Office
- Click for phone + hours + distance

#### 3.5 Multilingual UI
- i18n via `i18next` (5 languages: EN, HI, TE, BN, OR)
- Language switcher in header — persists to user profile
- All disease names, treatment steps, urgency labels translated
- Auto-detect from browser `navigator.language`

---

### PHASE 4 — DEMO PREPARATION (Hours 23–24)
**Goal: Blow judges away in the first 60 seconds.**

#### The Demo Script (4 minutes max)

**Minute 1 — The Problem (Emotional hook)**
> "14 million Indian farmers. 30–50% fish mortality in disease outbreaks.  
> A farmer named Raju in Nellore loses ₹1.5 lakh every time he misses early signs.  
> He has no nearby vet. No tool. No time.  
> We built that tool."

**Minute 2 — Core Demo (Live scan)**
1. Open AquaGuard on mobile
2. Point camera at infected fish image (pre-prepared demo photo)
3. Tap Scan — show loading animation
4. **BOOM** — Result appears:
   - Red urgency banner: "TREAT NOW — Bacterial Red Disease"
   - Confidence: 94% | Severity: HIGH
   - Grad-CAM heatmap fades in (infected region glowing)
   - Trust Meter: HIGH

**Minute 3 — Ecosystem depth**
1. Scroll to Economic Panel: "₹1,15,500 lost if you wait 7 days"
2. Show Day-by-Day Timeline: "Day 1: Apply Oxytetracycline bath"
3. Tap Telegram: Report delivered to phone in 3 seconds
4. Switch to Telugu — same UI, spoken in Telugu via TTS
5. Show Pond Risk Dashboard: "Pond B — Critical ↓"

**Minute 4 — Impact & Scale**
> "This isn't just a classifier.  
> It's a complete disease management ecosystem.  
> Economic intelligence. Explainable AI. Offline capable.  
> 5 languages. Works on a ₹5,000 Android phone.  
> Zero cost to farmer. Zero paid APIs.  
> 14 million farmers. Starting today."

Show the regional outbreak map. End.

---

## 🏗️ TECHNICAL ARCHITECTURE (Final)

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND                                    │
│                                                                  │
│   React 18 + Vite PWA — Firebase Hosting (free tier)           │
│   Tailwind CSS (or Vanilla CSS per design system)               │
│   Zustand state | react-router-dom routing                      │
│   i18next (5 languages) | Framer Motion (animations)           │
│   onnxruntime-web (offline inference) | Leaflet.js (maps)      │
│   recharts (charts) | jsPDF (export) | Web Speech API (voice)  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS + Firebase Auth Token
┌──────────────────────┴──────────────────────────────────────────┐
│                    FIREBASE LAYER                                │
│   Firebase Auth (Phone OTP + Google OAuth)                     │
│   Firebase Storage (image uploads, heatmap storage)           │
│   Cloud Firestore (user profiles, pond data, outbreaks)        │
│   Firebase Cloud Messaging (push notifications)                │
│   Firebase Hosting (frontend, free SSL, CDN)                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │ REST API
┌──────────────────────┴──────────────────────────────────────────┐
│                    FLASK BACKEND (Python 3.11)                  │
│                                                                  │
│   Deployed: Render.com / Railway (free tier)                   │
│   Docker-ready | Gunicorn | Rate limiting (flask-limiter)      │
│                                                                  │
│   ML Stack:                                                      │
│   ├── ResNet-50 (.pkl) → ONNX conversion                       │
│   ├── Real Grad-CAM (layer4 hook)                               │
│   ├── Cosine similarity search (numpy, sklearn)                │
│   └── ONNX Runtime (fast inference, CPU)                       │
│                                                                  │
│   Storage: SQLite (diagnoses, ponds, case vectors)              │
│   Auth: Firebase ID token verification                          │
│   External: Telegram Bot API, LibreTranslate                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   SQLite DB      Telegram Bot   Leaflet + OSM
   (local)        (free)         (free maps)
```

---

## 📋 FEATURE CHECKLIST — JUDGING CRITERIA MAP

| Feature | Impact | Difficulty | Judge Factor |
|---|---|---|---|
| ✅ AI Disease Detection (7 classes) | HIGH | DONE | Core requirement |
| ✅ Grad-CAM Heatmap Explanation | HIGH | Medium | Explainability = trust |
| ✅ Trust Meter (confidence gauge) | HIGH | Easy | Builds credibility |
| ✅ Economic Loss Calculator | VERY HIGH | Easy | Emotional impact |
| ✅ Day-by-Day Action Timeline | HIGH | Medium | Actionability |
| ✅ Disease Progression Simulator | HIGH | Medium | Foresight |
| ✅ Pond Risk Score Dashboard | HIGH | Medium | Ecosystem depth |
| ✅ Smart Outbreak Prediction | VERY HIGH | Medium | Innovation |
| ✅ Telegram Bot Integration | HIGH | Easy | Accessibility |
| ✅ Offline PWA Mode | HIGH | Medium | Rural relevance |
| ✅ 5-Language Support | HIGH | Medium | Inclusivity |
| ✅ Voice-First Interface | VERY HIGH | Medium | Differentiation |
| ✅ Nearby Vet Locator (Map) | MEDIUM | Easy | Completeness |
| ✅ PDF Report Export | MEDIUM | Easy | Professional polish |
| ✅ Similar Cases Browser | MEDIUM | Medium | XAI depth |
| ✅ Admin Regional Heatmap | HIGH | Medium | Scale story |
| ✅ Multilingual Telegram Reports | HIGH | Easy | Rural reach |
| ✅ Water Quality Advisory | MEDIUM | Easy | Preventive angle |

---

## 🔧 IMMEDIATE ACTION PLAN — BUILD ORDER

### Day 1 Tasks (Most Critical)

**Task 1: Model Integration** (2 hours)
```bash
# Convert ResNet-50 pkl to ONNX
pip install torch torchvision
python scripts/convert_to_onnx.py
# OR load directly via torch in backend/ml/runtime.py
```

**Task 2: Real Grad-CAM** (2 hours)
- Replace `backend/ml/xai.py` dummy with real ResNet-50 Grad-CAM
- Test: upload fish image → get colored heatmap overlay returned

**Task 3: Disease Knowledge Base** (1 hour)
- Complete `backend/data/disease_info.py` with all 7 classes
- All fields: treatment, causes, reasoning, severity, urgency

**Task 4: API End-to-End Test** (1 hour)
```bash
curl -X POST http://localhost:5000/api/diagnose \
  -H "Content-Type: application/json" \
  -d '{"image": "<base64>", "fish_count": 5000, "market_price_per_kg": 120, "avg_weight_kg": 0.35}'
```
Should return: disease, confidence, heatmap_image_b64, economic_loss, action_timeline

**Task 5: Frontend Core Screens** (4 hours)
- Scaffold with Vite + React
- Implement: Login → Scan → Report → Economic → Timeline

### Day 2 Tasks (Differentiators + Polish)

**Task 6: Telegram Bot** (1 hour)
- Create @AquaGuardBot via @BotFather (free)
- Wire `services/telegram.py` to send formatted report

**Task 7: Voice UI** (1 hour)
- Add floating mic FAB
- Wire Web Speech API with command handler

**Task 8: Pond Dashboard** (2 hours)
- Risk score cards with trend indicators
- Outbreak alert cards

**Task 9: Visual Polish** (2 hours)
- Apply biopunk design system from `AquaGuard_DESIGN.md`
- Animated urgency banners, glassmorphism cards, confidence gauges

**Task 10: Demo Preparation** (2 hours)
- Prepare 5 test fish images (healthy + each disease type)
- Test full flow end-to-end
- Rehearse 4-minute demo script
- Create demo video backup (in case of live demo failure)

---

## 🌐 FREE DEPLOYMENT STACK (Zero Cost)

| Component | Service | Free Tier |
|---|---|---|
| Frontend | Firebase Hosting | 10GB storage, 360MB/day transfer |
| Backend | Render.com | 750 hours/month free (auto-sleep) |
| Database | SQLite (bundled) | No external cost |
| Auth | Firebase Auth | Unlimited phone OTP |
| Storage | Firebase Storage | 5GB + 1GB/day transfer |
| Notifications | Firebase FCM | Unlimited |
| Maps | OpenStreetMap + Leaflet | 100% free forever |
| Translation | LibreTranslate (self-hosted) | Free on Render |
| Telegram | Telegram Bot API | Free |
| ML Inference | CPU (ONNX Runtime) | Free |
| Offline | Service Worker + ONNX Web | Free (bundled) |

**Total monthly cost: ₹0**

---

## 🏅 WHY THIS WINS

### Technical Excellence
- Real trained ResNet-50 model (not a demo placeholder)
- Grad-CAM explainable AI (industry-standard technique)
- Full-stack: React PWA + Flask REST + SQLite + Firebase
- Offline-capable with ONNX web inference

### Social Impact (Judges care about this most)
- Directly addresses 14 million farmers
- India-specific: local medicines, regional languages, Telegram (rural India's messaging app)
- Economic framing makes the impact concrete and measurable
- Accessibility: voice-first, large targets, offline, low bandwidth

### Innovation
- XAI heatmap + reasoning text (beyond detection)
- Outbreak prediction (geographic clustering)
- Real-time economic loss calculator (no competitor will have this)
- Pond risk scoring system (long-term value)
- Voice commands in regional languages

### Completeness
- Not a proof-of-concept — a complete system
- Backend, frontend, ML, integrations, database, auth, offline — all wired
- Multiple user personas addressed: farmer, expert, admin
- Demo-ready with a polished visual design

### The Unfair Advantage
We already have:
- A trained model (others are still training)
- A scaffolded backend (all routes exist)
- A complete design system (ready to implement)
- 4 detailed planning documents

**We are 40% done before the clock starts. We just need to build and connect.**

---

## 📌 CRITICAL SUCCESS FACTORS

> [!IMPORTANT]
> **Priority 1:** The live demo must work flawlessly. A broken demo = zero score.  
> Practice the 4-minute script at least 3 times before presenting.  
> Have a backup video recording of the full working demo.

> [!IMPORTANT]
> **Priority 2:** The Economic Loss Calculator must be visible and dramatic.  
> "₹1,15,500 lost if you wait 7 days" is the line judges will remember.  
> Make it animate. Make it impossible to ignore.

> [!IMPORTANT]
> **Priority 3:** The Grad-CAM heatmap must render on the real model.  
> This is what separates us from every other team. If it works, we win.

> [!TIP]
> **Pro tip:** During demo, open the app on a physical mobile phone, not a laptop browser.  
> Judges respond emotionally to seeing a product "on a real phone a farmer would use."

> [!TIP]
> **Pro tip:** Show the Telegram message arriving in real-time during the demo.  
> Have your phone on screen-share. The moment judges see a notification arrive — they're sold.

---

## 🔮 POST-HACKATHON VISION (Tell the Judges)

> "This is version 1.0. Here's where we take it:"

1. **WhatsApp Bot** — #1 messaging app in rural India, even larger reach than Telegram
2. **NDDB / NABARD Integration** — Connect to government fisheries data for real outbreak tracking
3. **Aquaculture Insurance API** — Plug loss data into microinsurance products
4. **Water Quality IoT Sensors** — Link pH/O2 sensors for predictive disease warnings
5. **Federated Learning** — Model improves from every farmer's scan without sharing private data
6. **State Government Dashboard** — District-level outbreak heatmap for fisheries departments
7. **Marketplace** — Connect farmers to medicine suppliers at lowest price after diagnosis

---

*AquaGuard XAI — Hackathon Master Plan | Version 3.0 | April 2026*  
*Team: keshav nabira | Email: keshavnabira.cse23@sbjit.edu.in*  
*"Every hour of detection delay costs ₹187. We end that."*
