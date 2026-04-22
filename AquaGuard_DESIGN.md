# 🎨 Design Specification
## AquaGuard XAI — UI/UX Design System
**Version:** 1.0 | April 2025

---

## 1. DESIGN PHILOSOPHY

### Core Principles

**1. Biopunk Utility** — The aesthetic draws from bioluminescent aquatic life: deep ocean greens, electric cyan, and amber warning hues against a near-black deep-water background. It feels like a sonar readout — technical, precise, alive.

**2. Trust Through Transparency** — Every AI decision is visually explained. Heatmaps, confidence gauges, and reasoning text are first-class UI citizens, never buried.

**3. Voice-First Accessibility** — Every core action is reachable by voice command. UI is a fallback, not the primary modality for rural farmers.

**4. Triage at a Glance** — Within 1 second of loading the result screen, a farmer knows whether to act, wait, or run. Urgency is communicated by colour, icon, and size — not by reading.

**5. Rural Resilience** — Large tap targets (min 48px), high contrast ratios (≥ 4.5:1), offline indicators, and bandwidth-conscious design.

---

## 2. TYPOGRAPHY

### Font Pairing

| Role | Font | Weight | Usage |
|---|---|---|---|
| Display / Brand | **Syne** | 700, 800 | Headings, disease names, score values |
| Body | **DM Sans** | 400, 500, 600 | Body text, labels, descriptions |
| Mono / Code | **JetBrains Mono** | 400, 700 | Confidence scores, API data, Day labels |

### Import
```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap');
```

### Scale

| Token | Size | Usage |
|---|---|---|
| --text-xs | 0.72rem | Labels, tags, helper text |
| --text-sm | 0.85rem | Secondary body, captions |
| --text-base | 0.95rem | Primary body text |
| --text-lg | 1.1rem | Subheadings, card titles |
| --text-xl | 1.4rem | Screen titles |
| --text-2xl | 1.8rem | Hero values, scores |
| --text-3xl | 2.4rem | Major KPI numbers |

---

## 3. COLOR SYSTEM

```css
:root {
  /* ── Backgrounds ────────────────── */
  --bg-deep:       #030F0B;   /* Main page background */
  --bg-surface:    rgba(255,255,255,0.04);   /* Card surface */
  --bg-elevated:   rgba(255,255,255,0.07);   /* Hover, active card */
  --bg-overlay:    rgba(3,15,11,0.92);       /* Modal backdrop */

  /* ── Brand / Primary ────────────── */
  --primary:       #00C896;   /* Main CTA, healthy state */
  --primary-dim:   rgba(0,200,150,0.12);
  --accent:        #00A3E0;   /* Water blue, secondary actions */
  --accent-dim:    rgba(0,163,224,0.12);

  /* ── Urgency States ─────────────── */
  --healthy:       #22C55E;   /* All good */
  --monitor:       #EAB308;   /* Watch closely */
  --treat:         #F97316;   /* Treat now */
  --critical:      #EF4444;   /* Isolate / emergency */

  /* ── Urgency Backgrounds ────────── */
  --healthy-bg:    rgba(34,197,94,0.08);
  --monitor-bg:    rgba(234,179,8,0.08);
  --treat-bg:      rgba(249,115,22,0.08);
  --critical-bg:   rgba(239,68,68,0.08);

  /* ── Text ────────────────────────── */
  --text-primary:  #E0F0EC;
  --text-secondary:#7ABFB0;
  --text-muted:    #3A6A5A;
  --text-disabled: #1E3A30;

  /* ── Borders ─────────────────────── */
  --border-subtle: rgba(255,255,255,0.06);
  --border-default:rgba(255,255,255,0.10);
  --border-accent: rgba(0,200,150,0.25);

  /* ── Gradients ───────────────────── */
  --gradient-brand: linear-gradient(135deg, #00C896, #00A3E0);
  --gradient-danger:linear-gradient(135deg, #EF4444, #DC2626);
  --gradient-bg:    linear-gradient(160deg, #030F0B 0%, #050F1C 100%);
}
```

---

## 4. COMPONENT LIBRARY

### 4.1 Button Variants

```css
/* Primary CTA */
.btn-primary {
  background: var(--gradient-brand);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 13px 24px;
  font-weight: 700;
  font-family: 'DM Sans';
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}
.btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
.btn-primary:active { transform: scale(0.98); }

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--primary);
  border: 1px solid rgba(0,200,150,0.35);
  border-radius: 12px;
  padding: 11px 22px;
}

/* Danger */
.btn-danger {
  background: var(--gradient-danger);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 13px 24px;
}
```

### 4.2 Card

```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 1.2rem 1.4rem;
  backdrop-filter: blur(8px);
  transition: border-color 0.2s, background 0.2s;
}
.card:hover {
  background: var(--bg-elevated);
  border-color: var(--border-default);
}
.card--urgent {
  border-color: rgba(239,68,68,0.35);
  background: var(--critical-bg);
}
.card--healthy {
  border-color: rgba(34,197,94,0.25);
  background: var(--healthy-bg);
}
```

### 4.3 Urgency Banner

```css
.urgency-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem 1.2rem;
  border-radius: 14px;
  border-width: 1px;
  border-style: solid;
}
.urgency-banner--healthy  { background: var(--healthy-bg);  border-color: rgba(34,197,94,0.3);  }
.urgency-banner--monitor  { background: var(--monitor-bg);  border-color: rgba(234,179,8,0.3);  }
.urgency-banner--treat    { background: var(--treat-bg);    border-color: rgba(249,115,22,0.3); }
.urgency-banner--critical { background: var(--critical-bg); border-color: rgba(239,68,68,0.3);  }
```

### 4.4 Confidence Gauge

```css
.confidence-track {
  height: 8px;
  background: rgba(255,255,255,0.06);
  border-radius: 99px;
  overflow: hidden;
}
.confidence-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1);
}
/* Color by threshold */
.confidence-fill--low    { background: var(--critical); }
.confidence-fill--medium { background: var(--monitor); }
.confidence-fill--high   { background: var(--gradient-brand); }
```

### 4.5 Tag / Badge

```css
.tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.73rem;
  font-weight: 700;
  border-width: 1px;
  border-style: solid;
}
```

### 4.6 Input Field

```css
.input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0,200,150,0.12);
}
```

---

## 5. SCREEN-BY-SCREEN DESIGN SPECIFICATION

### Screen 1 — Login

**Layout:** Full-screen centered card, max-width 380px  
**Background:** `--gradient-bg` with 2 radial gradient orbs (teal top-left, blue bottom-right)

```
┌─────────────────────────────┐
│       🐟  AquaGuard XAI     │  ← Syne 800 gradient text
│   AI Aquaculture Assistant  │  ← DM Sans muted
│                             │
│  [🌐 Language Selector]     │  ← Pill buttons: EN हिं తె বাং ଓ
│                             │
│  ┌─────────────────────┐   │
│  │  +91 _____________  │   │  ← Phone input
│  └─────────────────────┘   │
│  [  Send OTP  ]            │  ← Gradient primary button
│  ──── or ────              │
│  [🔵 Continue with Google] │  ← Ghost button
│                             │
│  By signing in you agree   │
│  to our Terms              │
└─────────────────────────────┘
```

---

### Screen 2 — Home Dashboard

**Layout:** Scrollable feed, sticky header, floating scan FAB

```
┌─────────────────────────────┐
│ 🐟 AquaGuard  [🌐] [🔔]    │  ← Header: brand + icons
│─────────────────────────────│
│ Good morning, Raju 👋        │
│ Your Farm · Nellore, AP     │
│─────────────────────────────│
│ ┌─ OUTBREAK ALERT ────────┐ │
│ │ 🚨 Pond C — Critical    │ │  ← Red banner, dismissible
│ │ 4 critical in 7 days   │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │  📷  Scan Fish Now      │ │  ← Large gradient CTA card
│ │  AI detection < 3 sec  │ │
│ └─────────────────────────┘ │
│                             │
│ MY PONDS                    │
│ ┌──────────┐ ┌──────────┐  │
│ │ Pond A   │ │ Pond B   │  │  ← Pond score cards (2-col)
│ │ 🟡  72   │ │ 🟢  95   │  │
│ └──────────┘ └──────────┘  │
│ ┌──────────┐               │
│ │ Pond C   │               │
│ │ 🔴  41 ⚠│               │
│ └──────────┘               │
│                             │
│ RECENT DETECTIONS           │
│ [Detection history cards]   │
└─────────────────────────────┘
     [🏠] [📷] [📋] [📊]     ← Bottom nav
```

---

### Screen 3 — Scan

**Layout:** Two-step: Input Method → Preview → Detecting → Result

**Step 1: Choose Input**
```
┌─────────────────────────────┐
│ ← Scan Fish                 │
│                             │
│ Choose how to capture       │
│                             │
│ ┌──────────┐ ┌──────────┐  │
│ │  📷      │ │  🖼️      │  │
│ │  Live    │ │  Upload  │  │
│ │  Camera  │ │  Photo   │  │
│ └──────────┘ └──────────┘  │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📌 Tips for better scan │ │
│ │ • Good lighting         │ │
│ │ • Full body visible     │ │
│ │ • Hold fish steady      │ │
│ └─────────────────────────┘ │
│                             │
│ 🎙 Or say "Start scan"     │  ← Voice hint
└─────────────────────────────┘
```

**Step 2: Detecting (loading)**
```
┌─────────────────────────────┐
│         [Fish preview]      │
│   ┌──────────────────────┐  │
│   │  Grad-CAM generating │  │
│   │  ████░░░░░░  68%    │  │
│   └──────────────────────┘  │
│   🧠 Running AI inference   │
│   Checking 7 disease classes│
└─────────────────────────────┘
```

---

### Screen 4 — XAI Report Card

**Layout:** Scrollable report, sticky urgency banner, tabbed sections

```
┌─────────────────────────────┐
│ ┌─ 🔴 TREAT NOW ─────────┐  │
│ │ Begin treatment today  │  │  ← Urgency banner (sticky)
│ └────────────────────────┘  │
│                             │
│ ┌─ Diagnosis ─────────────┐ │
│ │ 🔴 Bacterial Red Disease│ │
│ │ [Bacterial]  ████ 94%  │ │  ← Confidence gauge
│ │ Severity: HIGH          │ │
│ └────────────────────────┘  │
│                             │
│ ┌─ AI Explanation ────────┐ │
│ │ [FISH IMAGE + HEATMAP]  │ │  ← Grad-CAM overlay
│ │ 🌡 Hot region: dorsal  │ │
│ │                         │ │
│ │ Trust Meter: ████░ 94% │ │
│ │ "High confidence —      │ │
│ │  Expert review optional"│ │
│ │                         │ │
│ │ Detected due to:        │ │
│ │ • Hemorrhagic red spots │ │
│ │ • Fin discoloration     │ │
│ │ • Lateral skin ulcers   │ │
│ └────────────────────────┘  │
│                             │
│ ┌─ All Class Confidence ──┐ │
│ │ Bacterial Red  ████ 94% │ │  ← Mini bar chart all 7
│ │ Bacterial Gill █░░░  4% │ │
│ │ Aeromoniasis   ░░░░  1% │ │
│ │ ...                     │ │
│ └────────────────────────┘  │
│                             │
│ [Treatment] [Economic] [Timeline] [Similar]  ← Tabs
│                             │
│ ┌─ Treatment (active tab)─┐ │
│ │ 💊 Oxytetracycline      │ │
│ │ 50mg/L bath, 1 hour     │ │
│ │ Available: Rural markets│ │
│ │ Cost: ~₹120/pond        │ │
│ └────────────────────────┘  │
│                             │
│ [📄 PDF] [📱 Telegram]      │
└─────────────────────────────┘
```

---

### Screen 5 — Economic Loss Predictor

```
┌─────────────────────────────┐
│ 💰 Economic Loss Predictor  │
│─────────────────────────────│
│ Enter your pond details:    │
│                             │
│ Fish Count    [___5000___]  │
│ Market Price  [___₹120___]  │
│ Avg Weight    [___0.35 kg_] │
│                             │
│ [Calculate Loss]            │
│─────────────────────────────│
│                             │
│ PROJECTED LOSS              │
│ ┌─────────────────────────┐ │
│ │ Treat TODAY:  ₹12,000  │ │  ← Green (treatment cost)
│ │ Delay 3 days: ₹84,000  │ │  ← Orange
│ │ Delay 7 days: ₹1,47,000│ │  ← Red
│ │ Delay 14 days:₹2,94,000│ │  ← Dark red
│ └─────────────────────────┘ │
│                             │
│ [Bar chart comparison]      │
│                             │
│ Mortality Rate: ~40%        │
│ Projected deaths: 2,000 fish│
│ At ₹120/kg × 0.35kg avg    │
└─────────────────────────────┘
```

---

### Screen 6 — Action Timeline

```
┌─────────────────────────────┐
│ ⏰ Treatment Timeline       │
│ Bacterial Red Disease       │
│─────────────────────────────│
│                             │
│ ● DAY 0 — Today             │  ← Active circle
│ │ • Isolate infected fish   │
│ │ • Stop feeding            │
│ │ • Count affected: ~50     │
│                             │
│ ● DAY 1                     │
│ │ 💊 Oxytetracycline bath  │
│ │    50mg/L for 1 hour      │
│ │ 💧 Aerate pond            │
│ │ 👁 Check for new spots    │
│                             │
│ ● DAY 3                     │
│ │ 💊 Repeat bath treatment  │
│ │ 💧 30% water change       │
│ │ ⚠  If worse → call expert │
│                             │
│ ● DAY 5                     │
│ │ 💊 Final treatment dose   │
│ │ 📊 Re-scan fish           │
│                             │
│ ● DAY 7 — Review            │
│   ✅ If healed: resume feed │
│   🚨 If not: emergency vet  │
│                             │
│ [📄 Download Plan]          │
│ [📱 Send to Telegram]       │
└─────────────────────────────┘
```

---

### Screen 7 — Disease Progression Simulator

```
┌─────────────────────────────┐
│ 📈 Disease Progression      │
│ (If left untreated)         │
│─────────────────────────────│
│                             │
│ ┌────┐    ┌────┐    ┌────┐  │
│ │ S1 │───►│ S2 │───►│ S3 │  │  ← Stage timeline
│ └────┘    └────┘    └────┘  │
│  Day 0    Day 3     Day 7   │
│  5% mort  20% mort  45% mort│
│                             │
│ ▼ STAGE 1 (Current — Day 0) │
│ ┌─────────────────────────┐ │
│ │ 🟡 Mild                 │ │
│ │ Localized red spots     │ │
│ │ 5% mortality            │ │
│ │ Easily treatable        │ │
│ └─────────────────────────┘ │
│                             │
│ ▶ STAGE 2 (Day 3+, untreated│
│ ┌─────────────────────────┐ │
│ │ 🟠 Moderate             │ │
│ │ Spreading ulcers        │ │
│ │ 20% mortality           │ │
│ └─────────────────────────┘ │
│                             │
│ ▶ STAGE 3 (Day 7+)         │
│ ┌─────────────────────────┐ │
│ │ 🔴 Severe               │ │
│ │ Deep lesions, lethargy  │ │
│ │ 45% mortality           │ │
│ └─────────────────────────┘ │
│                             │
│ 💀 STAGE 4 (Day 14+)       │
│ ┌─────────────────────────┐ │
│ │ ⚫ Critical             │ │
│ │ Pond-wide infection     │ │
│ │ 80%+ mortality          │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

### Screen 8 — Vet Locator

```
┌─────────────────────────────┐
│ 📍 Nearby Veterinarians     │
│─────────────────────────────│
│ [Filter: All | Aqua | Govt] │
│                             │
│ ┌─────────────────────────┐ │
│ │  [ LEAFLET MAP HERE ]   │ │
│ │  📍 You (Nellore)       │ │
│ │  🩺 Dr. Ramesh 4.2km    │ │
│ │  🏛 Fisheries Dept 6km  │ │
│ │  🩺 Dr. Priya 8.5km     │ │
│ └─────────────────────────┘ │
│                             │
│ NEAREST VETS                │
│ ┌─────────────────────────┐ │
│ │ 🩺 Dr. Ramesh Kumar     │ │
│ │ Aquaculture Specialist  │ │
│ │ 4.2 km · 📞 9876543210  │ │
│ │ [Call Now] [Directions] │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

## 6. ICONOGRAPHY

| Context | Icon | Source |
|---|---|---|
| Disease categories | 🔴🍄🦠💀🫁⚠️🐟 | Emoji (zero dependency) |
| Navigation | 🏠📷📋📊 | Emoji |
| Urgency | ✅👁💊🚨 | Emoji |
| Actions | 📄📱🎙🗺 | Emoji |
| AI/Tech | 🧠🔬🌡 | Emoji |

Using emoji icons ensures zero external dependency and works in all browsers including ancient Android WebViews.

---

## 7. MOTION & ANIMATION

### Principles
- One orchestrated entrance per screen (staggered card reveals)
- Meaningful transitions only: confidence fill, heatmap fade-in, urgency banner pulse
- Respect `prefers-reduced-motion`

### Key Animations

```css
/* Entrance — staggered card reveal */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.card { animation: fadeUp 0.4s ease both; }
.card:nth-child(2) { animation-delay: 0.1s; }
.card:nth-child(3) { animation-delay: 0.2s; }

/* Confidence fill */
@keyframes fillBar {
  from { width: 0%; }
}
.confidence-fill { animation: fillBar 0.8s cubic-bezier(0.34,1.56,0.64,1) both; }

/* Critical pulse */
@keyframes urgentPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
  50%       { box-shadow: 0 0 0 8px rgba(239,68,68,0.15); }
}
.urgency-banner--critical { animation: urgentPulse 2s ease infinite; }

/* Detection spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.spinner {
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
```

---

## 8. RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile (primary) | 320–480px | Single column, bottom nav, full-width cards |
| Tablet | 481–768px | Two-column pond cards, side nav |
| Desktop (expert) | 769px+ | Three-column dashboard, persistent sidebar |

---

## 9. ACCESSIBILITY

| Requirement | Implementation |
|---|---|
| Tap target minimum | 48×48px (all buttons) |
| Colour contrast | ≥ 4.5:1 (WCAG AA) for all text |
| Voice alternative | Every action has voice command |
| Screen reader | Semantic HTML, aria-labels on all icons |
| Focus ring | Visible custom focus ring: `outline: 2px solid var(--primary)` |
| Large text mode | +20% text scale option in Settings |
| Offline indicator | Persistent "Offline Mode" banner when no network |

---

## 10. OFFLINE MODE UI

```
┌─────────────────────────────┐
│ 📡 OFFLINE MODE             │  ← Persistent amber top banner
│ Detection works · Sync later│
│─────────────────────────────│
│                             │
│ [Normal scan UI works]      │
│                             │
│ Note: Heatmap unavailable   │
│       offline. Classification│
│       and report available. │
│                             │
│ 3 scans queued for sync     │  ← Counter badge
│ [Sync Now when online]      │
└─────────────────────────────┘
```

---

*Design System Owner: AquaGuard Team | Version 1.0 | April 2025*
