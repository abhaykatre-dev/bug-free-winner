import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Share2, CheckCircle2, AlertCircle, Calendar, Thermometer,
  Droplets, ArrowLeft, Volume2, VolumeX, MapPin, TrendingDown,
  Activity, ChevronRight, Navigation, Phone, AlertTriangle, Pill,
  Leaf, ChevronDown, ChevronUp, Check, WifiOff,
} from 'lucide-react';
import clsx from 'clsx';
import styles from './DiagnosisResult.module.css';
import { TrustMeter } from '../../components/TrustMeter/TrustMeter';
import { getDiseaseProgression } from '../../data/diseaseData';
import { useLang } from '../../context/LangContext';
import { cacheResult, saveApprovedPlan } from '../../hooks/useOfflineSync';

const NAGPUR_VETS = [
  { id: 1, name: "Govt. Veterinary Hospital", address: "Ambazari Rd, Nagpur", phone: "+91 712 255 3344", lat: 21.1368, lng: 79.0594, hours: "9 AM–5 PM Mon–Fri" },
  { id: 2, name: "Royal Pet Clinic",           address: "Chhatrapati Nagar, Nagpur", phone: "+91 94230 12345", lat: 21.1104, lng: 79.0527, hours: "10 AM–7 PM All days" },
  { id: 3, name: "Precise Pet Clinic",         address: "Pratap Nagar, Nagpur", phone: "+91 98230 44567", lat: 21.1247, lng: 79.0401, hours: "9 AM–9 PM" },
  { id: 4, name: "LifeLine Pet Clinic",        address: "Nandanvan, Nagpur", phone: "+91 91584 78920", lat: 21.1417, lng: 79.1128, hours: "8 AM–8 PM" },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Emergency care rules per severity
const EMERGENCY_RULES: Record<string, { steps: string[]; critical: boolean }> = {
  Critical: {
    critical: true,
    steps: [
      'Immediately isolate affected fish into a separate quarantine tank',
      'Increase aeration — raise dissolved oxygen above 7 mg/L',
      'Stop all feeding for 24–48 hours to reduce metabolic load',
      'Begin antibiotic treatment within 6 hours of detection',
      'Call the nearest aquaculture vet — do NOT wait for symptoms to worsen',
      'Do NOT mix nets, buckets, or equipment between infected and healthy ponds',
    ],
  },
  Warning: {
    critical: false,
    steps: [
      'Separate visibly affected fish from the main population',
      'Test water quality immediately — pH, ammonia, dissolved oxygen',
      'Begin low-dose prophylactic treatment as prescribed',
      'Reduce stocking density by 30% if pond is overcrowded',
      'Monitor fish behavior every 4 hours for the next 48 hours',
    ],
  },
  Safe: {
    critical: false,
    steps: [
      'Maintain regular water quality checks weekly',
      'Continue current feeding schedule and stocking density',
      'Quarantine any new fish for 14 days before introduction',
    ],
  },
};

export const DiagnosisResult: React.FC = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { id }    = useParams();
  const { t }     = useLang();

  const raw           = location.state?.resultData;
  const originalImage = location.state?.originalImage;

  const [showModal,    setShowModal]    = useState(false);
  const [phone,        setPhone]        = useState('');
  const [chatId,       setChatId]       = useState(import.meta.env.VITE_TELEGRAM_CHAT_ID || '');
  const [alertStatus,  setAlertStatus]  = useState<string | null>(null);
  const [isSpeaking,   setIsSpeaking]   = useState(false);
  const [fishCount,    setFishCount]    = useState(500);
  const [pricePerKg,   setPricePerKg]   = useState(120);
  const [nearestVet,   setNearestVet]   = useState(NAGPUR_VETS[0]);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [showProg,     setShowProg]     = useState(false);
  const [approved,     setApproved]     = useState(false);

  const API_URL = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5001/api';

  useEffect(() => { if (!raw) navigate('/diagnose'); }, [raw, navigate]);

  // Cache every result when viewed (enables offline replay)
  useEffect(() => {
    if (raw && id) cacheResult(id, raw, originalImage ?? null);
  }, [id, raw, originalImage]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      let nearest = NAGPUR_VETS[0], minD = Infinity;
      NAGPUR_VETS.forEach(v => {
        const d = haversineKm(pos.coords.latitude, pos.coords.longitude, v.lat, v.lng);
        if (d < minD) { minD = d; nearest = v; }
      });
      setNearestVet(nearest);
    });
  }, []);

  if (!raw) return null;

  // Normalise API response keys
  const predictions: { disease: string; confidence: number }[] =
    raw.top_predictions ?? raw.predictions ?? [];
  const topPrediction = predictions[0] ?? { disease: raw.primary_disease ?? 'Unknown', confidence: raw.confidence ?? 0 };
  const severity: string  = raw.severity ?? 'Warning';
  const reasoning: string = raw.reasoning ?? raw.explainability?.reasoning ?? '';
  const heatmapB64        = raw.heatmap_image_b64 ?? raw.explainability?.heatmap_base64 ?? null;
  const treatment         = raw.treatment ?? {};
  const medications: any[] = treatment.medicines ?? [];
  const isHealthy         = topPrediction.disease === 'Healthy Fish';
  const causes            = raw.causes ?? {};
  const biologicalCauses: string[] = causes.biological ?? [];
  const envCauses: string[]        = causes.environmental ?? [];
  const timeline: any[]            = raw.action_timeline ?? [];
  const similarCases: any[]        = raw.similar_cases ?? [];

  // Economic
  const mortalityRate  = severity === 'Critical' ? 0.7 : severity === 'Warning' ? 0.35 : 0.05;
  const estimatedLoss  = isHealthy ? 0 : Math.round(fishCount * mortalityRate * 0.5 * pricePerKg);
  const treatmentCost  = isHealthy ? 0 : Math.round(fishCount * 8);
  const netSavings     = Math.max(0, estimatedLoss - treatmentCost);

  // Emergency rules
  const emergency = EMERGENCY_RULES[severity] ?? EMERGENCY_RULES.Warning;

  // Severity color — Healthy Fish is always green/safe
  const effectiveSeverity = isHealthy ? 'Safe' : severity;
  const sevColor = effectiveSeverity === 'Safe' ? 'var(--success)' : effectiveSeverity === 'Critical' ? 'var(--danger)' : 'var(--warning)';
  const sevBadge = effectiveSeverity === 'Safe' ? 'safe' : effectiveSeverity === 'Critical' ? 'critical' : 'warning';

  // Disease progression data
  const progression = getDiseaseProgression(topPrediction.disease);

  // Voice
  const handleVoice = () => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const txt = `Disease detected: ${topPrediction.disease}. Severity: ${severity}. Confidence: ${(topPrediction.confidence * 100).toFixed(0)} percent. ${reasoning}. Contact ${nearestVet.name} at ${nearestVet.phone}.`;
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'en-IN'; u.rate = 0.9;
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
    setIsSpeaking(true);
  };

  // Alert
  const handleAlert = async (type: 'sms' | 'telegram') => {
    setAlertStatus('Sending…');
    const msg = `AquaGuard Report\nDisease: ${topPrediction.disease}\nSeverity: ${severity}\nConfidence: ${(topPrediction.confidence * 100).toFixed(1)}%\nEst. Loss: Rs.${estimatedLoss.toLocaleString()}\nNearest Vet: ${nearestVet.name} ${nearestVet.phone}`;
    try {
      const payload = type === 'sms' ? { phone, message: msg } : { chat_id: chatId, message: msg };
      const res     = await fetch(`${API_URL}/alert/${type}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Server error');
      setAlertStatus(`Sent via ${type.toUpperCase()} successfully!`);
      setTimeout(() => setShowModal(false), 2000);
    } catch (err: any) {
      setAlertStatus(`Failed: ${err.message || 'Check backend'}`);
    }
  };

  return (
    <div className={styles.page}>

      {/* ── Alert Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            <h2 className={styles.modalTitle}>Alert & Export Report</h2>
            <p className={styles.modalSub}>Sends disease name, confidence, economic loss, and nearest vet details.</p>
            <div className={styles.modalSection}>
              <label className={styles.modalLabel}>Phone (Fast2SMS)</label>
              <input className={styles.modalInput} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210"/>
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => handleAlert('sms')}>Send SMS</button>
            </div>
            <div className={styles.modalDivider}>— or —</div>
            <div className={styles.modalSection}>
              <label className={styles.modalLabel}>Telegram Chat ID</label>
              <input className={styles.modalInput} value={chatId} onChange={e => setChatId(e.target.value)} placeholder="1833628886"/>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => handleAlert('telegram')}>Send via Telegram</button>
            </div>
            {alertStatus && (
              <div className={alertStatus.includes('Failed') ? styles.alertError : styles.alertSuccess}>
                {alertStatus}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className="flex items-center gap-3">
          <button className={styles.backBtn} onClick={() => navigate('/diagnose')}><ArrowLeft size={18}/></button>
          <div>
            <div className={styles.caseId}>CASE #{id} · {new Date().toLocaleDateString('en-IN')}</div>
            <h1 className={styles.caseTitle} style={{ color: isHealthy ? 'var(--success)' : sevColor }}>
              {topPrediction.disease}
            </h1>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className={clsx('btn', isSpeaking ? 'btn-primary' : 'btn-outline')} onClick={handleVoice}>
            {isSpeaking ? <VolumeX size={14}/> : <Volume2 size={14}/>}
            {isSpeaking ? 'Stop' : 'Read Aloud'}
          </button>
          <button className="btn btn-outline" onClick={() => { setShowModal(true); setAlertStatus(null); }}>
            <Share2 size={14}/> Alert & Export
          </button>
          <button
            className={clsx('btn', approved ? 'btn-outline' : 'btn-primary')}
            onClick={() => {
              if (!approved) {
                saveApprovedPlan({
                  diagnosisId:    id ?? `dx_${Date.now()}`,
                  disease:        topPrediction.disease,
                  severity:       effectiveSeverity,
                  confidence:     topPrediction.confidence,
                  completedSteps: Object.keys(checkedSteps).filter(k => checkedSteps[+k]).map(Number),
                });
                setApproved(true);
              }
            }}
          >
            <CheckCircle2 size={14}/>
            {approved ? 'Plan Approved ✓' : t('Approve Plan')}
          </button>
        </div>
      </div>

      {/* Offline Preliminary Banner */}
      {raw?.offline && (
        <div className={styles.offlinePrelimBanner}>
          <WifiOff size={16} style={{ flexShrink: 0 }}/>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Offline — Preliminary Record</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>This scan is queued. Full AI analysis will run and replace this automatically when your device reconnects.</div>
          </div>
        </div>
      )}

      {/* Emergency Care Banner — ONLY for non-healthy Critical cases */}
      {!isHealthy && emergency.critical && (
        <div className={styles.emergencyBanner}>
          <AlertTriangle size={20} color="white" style={{ flexShrink: 0 }}/>
          <div>
            <div className={styles.emergencyTitle}>Emergency Action Required</div>
            <div className={styles.emergencySteps}>
              {emergency.steps.slice(0, 3).map((s, i) => (
                <span key={i} className={styles.emergencyStep}>
                  <span className={styles.emergencyNum}>{i + 1}</span>{s}
                </span>
              ))}
            </div>
          </div>
          <a href={`tel:${nearestVet.phone}`} className={styles.emergencyCall}>
            <Phone size={14}/> Call Vet Now
          </a>
        </div>
      )}

      {/* ── TOP ROW: Image (compact) + Confidence + Summary ────────── */}
      <div className={styles.topRow}>

        {/* Image — compact, no zoom */}
        <div className={styles.imageCard}>
          <div className={styles.imageWrap}>
            {originalImage
              ? <img src={originalImage} alt="Fish" className={styles.fishImg}/>
              : <div className={styles.noImage}><Activity size={40} color="var(--border-color)"/><span>No image</span></div>
            }
            {heatmapB64 && (
              <img src={`data:image/png;base64,${heatmapB64}`} alt="Grad-CAM" className={styles.heatmapLayer}/>
            )}
            <div className={styles.imgBadge}>
              <span style={{ fontWeight: 700, fontSize: '0.8rem', color: isHealthy ? 'var(--success)' : sevColor }}>
                {isHealthy ? 'Healthy' : 'Pathogen Detected'}
              </span>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>MobileNetV2</div>
            </div>
          </div>
          {heatmapB64 && (
            <div className={styles.heatmapLegend}>
              <span>Low</span>
              <div className={styles.legendGrad}/>
              <span>High</span>
            </div>
          )}
        </div>

        {/* Confidence Breakdown + Trust Meter */}
        <div className={clsx('card', styles.confidenceCard)}>
          <div className={styles.cardLabel}>{t('AI Confidence Breakdown')}</div>

          {/* Trust Meter — severity-aware color */}
          <TrustMeter
            confidence={topPrediction.confidence}
            isHealthy={isHealthy}
            severity={effectiveSeverity}
            t={t}
          />

          {isHealthy ? (
            /* ── Healthy Fish — special green view ── */
            <div className={styles.healthyBox}>
              <div className={styles.healthyIcon}><Leaf size={22} color="var(--success)"/></div>
              <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1rem', marginBottom: '0.25rem' }}>{t('All Good')}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t('Your fish appear healthy')}</div>
            </div>
          ) : (
            <>
              {predictions.slice(0, 3).map((p, i) => (
                <div key={i} style={{ marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                    <span style={{ color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: i === 0 ? 600 : 400 }}>{p.disease}</span>
                    <span style={{ fontWeight: 700, color: i === 0 ? sevColor : 'var(--text-secondary)' }}>{(p.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: i === 0 ? sevColor : '#E2E8F0', width: `${(p.confidence * 100).toFixed(0)}%` }}/>
                  </div>
                </div>
              ))}
            </>
          )}
          <div className={styles.metaRow}>
            <span className={clsx('badge', sevBadge)}>{t('Severity')}: {effectiveSeverity}</span>
            {raw.translated && <span style={{ fontSize: '0.68rem', color: 'var(--brand-primary)', fontWeight: 600 }}>Translated</span>}
          </div>
        </div>

        {/* Diagnosis Summary */}
        <div className={clsx('card', styles.summaryCard)}>
          <div className={styles.cardLabel}>Diagnosis Summary</div>
          {biologicalCauses.length > 0 && (
            <div className={styles.causeBox}>
              <div className={styles.causeLabel}>Biological Cause</div>
              {biologicalCauses.slice(0, 2).map((c, i) => (
                <div key={i} className={styles.causeItem}>{c}</div>
              ))}
            </div>
          )}
          {envCauses.length > 0 && (
            <div className={styles.causeBox}>
              <div className={styles.causeLabel}>Environmental Triggers</div>
              {envCauses.slice(0, 2).map((c, i) => (
                <div key={i} className={styles.causeItem}>{c}</div>
              ))}
            </div>
          )}
          {reasoning && (
            <div className={styles.causeBox}>
              <div className={styles.causeLabel}>AI Reasoning</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.55, margin: 0 }}>{reasoning}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── MIDDLE ROW: Treatment Timeline + Medication + Vet ───────── */}
      <div className={styles.midRow}>

        {/* Treatment Timeline */}
        <div className={clsx('card', styles.timelineCard)}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
            <div className={styles.cardLabel} style={{ margin: 0 }}>Recovery Timeline</div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--brand-primary)', background: '#A5F3FC', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>14-DAY PLAN</span>
          </div>
          <div className={styles.stepper}>
            {(timeline.length > 0 ? timeline.slice(0, 5) : [
              { day_range: 'Day 1–3',   action: 'Isolate affected fish into quarantine tank', details: 'Separate visibly sick fish immediately' },
              { day_range: 'Day 4–7',   action: 'Begin antibiotic / antifungal dosage',      details: 'Per prescription: twice daily' },
              { day_range: 'Day 8–10',  action: '60% water exchange + salt treatment',        details: '3–5 g/L NaCl for 30 min' },
              { day_range: 'Day 11–14', action: 'Monitor recovery + check for recurrence',    details: 'Daily observation, test DO and pH' },
              { day_range: 'Day 15',    action: 'Final health assessment + reintroduce',      details: 'Only if fully recovered' },
            ]).map((step: any, i: number) => {
              const done = !!checkedSteps[i];
              return (
                <div key={i} className={clsx(styles.checkStep, done && styles.checkStepDone)}
                  onClick={() => setCheckedSteps(prev => ({ ...prev, [i]: !done }))}>
                  <div className={clsx(styles.checkbox, done && styles.checkboxDone)}>
                    {done && <Check size={11} color="white"/>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={styles.checkDay}>{step.day_range ?? `Day ${i * 3 + 1}`}</div>
                    <div className={clsx(styles.checkAction, done && styles.checkActionDone)}>{step.action ?? step.title ?? ''}</div>
                    {step.details && <div className={styles.checkDetail}>{step.details}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          {reasoning && (
            <div className={styles.reasoningBox}>
              <AlertCircle size={13} color="var(--brand-primary)" style={{ flexShrink: 0 }}/>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--brand-primary)', lineHeight: 1.5 }}>{reasoning.slice(0, 160)}…</p>
            </div>
          )}
        </div>

        {/* Medication */}
        <div className={clsx('card', styles.medCard)}>
          <div className={styles.cardLabel}>Medication Protocol</div>
          {medications.length > 0 ? (
            <>
              <div className={styles.medHighlight}>
                <div className={styles.medIcon}><Pill size={18} color="var(--brand-primary)"/></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{typeof medications[0] === 'string' ? medications[0] : medications[0].name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Primary Treatment</div>
                </div>
              </div>
              {medications[0]?.dose && <div className={styles.medProp}><span>Dosage</span><span className={styles.medVal}>{medications[0].dose}</span></div>}
              {medications[0]?.frequency && <div className={styles.medProp}><span>Frequency</span><span className={styles.medVal}>{medications[0].frequency}</span></div>}
              <div className={styles.medProp}><span>Duration</span><span className={styles.medVal}>14 days</span></div>
              {treatment.disclaimer && (
                <div className={styles.disclaimer}>{treatment.disclaimer}</div>
              )}
            </>
          ) : (
            <div className={styles.noMed}>Consult aquaculture veterinarian for prescription</div>
          )}
        </div>

        {/* Nearest Vet */}
        <div className={clsx('card', styles.vetCard)}>
          <div className="flex justify-between items-center" style={{ marginBottom: '0.85rem' }}>
            <div className={styles.cardLabel} style={{ margin: 0 }}>
              <MapPin size={13} style={{ display: 'inline', marginRight: 4, color: 'var(--brand-primary)' }}/>
              Nearest Vet — Nagpur
            </div>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--brand-primary)', background: '#CCFBF1', padding: '0.15rem 0.5rem', borderRadius: '99px' }}>GPS MATCH</span>
          </div>
          <div className={styles.vetBox}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{nearestVet.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{nearestVet.address}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--brand-primary)', fontWeight: 600, marginTop: '0.35rem' }}>{nearestVet.phone}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{nearestVet.hours}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
            <a href={`tel:${nearestVet.phone}`} className="btn btn-outline" style={{ flex: 1, textAlign: 'center', fontSize: '0.78rem', padding: '0.5rem' }}>
              <Phone size={13}/> Call
            </a>
            <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.78rem', padding: '0.5rem' }} onClick={() => navigate('/map')}>
              All Vets <ChevronRight size={13}/>
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: Emergency Steps + Economic + Similar ─────────── */}
      <div className={styles.bottomRow}>

        {/* Emergency Care Steps — hidden for healthy fish */}
        {!isHealthy && (
        <div className={clsx('card', styles.emergencyCard)}>
          <div className={styles.cardLabel} style={{ color: emergency.critical ? 'var(--danger)' : 'var(--warning)' }}>
            <AlertTriangle size={14}/> Emergency Care Plan
          </div>
          <div className={styles.emergencyList}>
            {emergency.steps.map((step, i) => (
              <div key={i} className={styles.emergencyItem}>
                <div className={styles.emergencyBullet} style={{ background: emergency.critical ? '#FEE2E2' : '#FEF9C3', color: emergency.critical ? 'var(--danger)' : '#92400E' }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
        )} {/* end !isHealthy emergency */}

        {/* Economic Loss */}
        {!isHealthy && (
          <div className={clsx('card', styles.econCard)}>
            <div className={styles.cardLabel}><TrendingDown size={14}/> Economic Impact</div>
            <div className={styles.econInputRow}>
              <div className={styles.econInput}>
                <label>Fish Count</label>
                <input type="number" value={fishCount} onChange={e => setFishCount(+e.target.value)} className={styles.numInput}/>
              </div>
              <div className={styles.econInput}>
                <label>Price/kg (₹)</label>
                <input type="number" value={pricePerKg} onChange={e => setPricePerKg(+e.target.value)} className={styles.numInput}/>
              </div>
            </div>
            <div className={styles.econStats}>
              <div className={styles.econStat} style={{ borderLeft: '3px solid var(--danger)', background: '#FEF2F2' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Loss Without Treatment</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--danger)' }}>₹{estimatedLoss.toLocaleString('en-IN')}</div>
              </div>
              <div className={styles.econStat} style={{ borderLeft: '3px solid var(--warning)', background: '#FFFBEB' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Treatment Cost</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--warning)' }}>₹{treatmentCost.toLocaleString('en-IN')}</div>
              </div>
              <div className={styles.econStat} style={{ borderLeft: '3px solid var(--success)', background: '#F0FDF4' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Net Savings</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success)' }}>₹{netSavings.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Similar Cases */}
        {similarCases.length > 0 && (
          <div className={clsx('card', styles.similarCard)}>
            <div className={styles.cardLabel}>Similar Cases</div>
            {similarCases.slice(0, 3).map((c: any, i: number) => (
              <div key={i} className={styles.similarRow}>
                <div className={styles.similarThumb}><Activity size={16} color="var(--brand-primary)"/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.83rem' }}>{c.disease}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{c.outcome ?? 'Resolved with treatment'}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--brand-primary)' }}>
                  {Math.round((c.similarity ?? 0) * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FULL-WIDTH: Disease Progression OR Healthy Care Tips ────── */}
      {isHealthy ? (
        /* Healthy Fish — Care Tips */
        <div className={clsx('card', styles.careTipsCard)}>
          <div className={styles.cardLabel} style={{ color: 'var(--success)' }}>
            <Leaf size={14}/> {t('Care Tips')} — Keep Your Fish Healthy
          </div>
          <div className={styles.careTipsGrid}>
            {(progression?.care_tips ?? []).map((tip, i) => (
              <div key={i} className={styles.careTip}>
                <div className={styles.tipNum} style={{ background: '#DCFCE7', color: 'var(--success)' }}>{i + 1}</div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Disease Progression Simulator */
        progression && progression.stages.length > 0 && (
          <div className={clsx('card', styles.progressionCard)}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <div className={styles.cardLabel} style={{ color: 'var(--danger)', margin: 0 }}>
                <AlertTriangle size={14}/> {t('Disease Progression')} — {t('Without Treatment')}
              </div>
              <button className={styles.toggleBtn} onClick={() => setShowProg(p => !p)}>
                {showProg ? <><ChevronUp size={13}/> Hide</> : <><ChevronDown size={13}/> Show</>}
              </button>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
              This shows what will happen if the disease is left untreated. Use this to make the right decision fast.
            </p>
            {showProg && (
              <div className={styles.stageGrid}>
                {progression.stages.map((stage) => (
                  <div key={stage.stage} className={styles.stageCard} style={{ borderTop: `4px solid ${stage.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {t('Stage')} {stage.stage}
                        </div>
                        <div style={{ fontWeight: 700, color: stage.color, fontSize: '0.9rem' }}>{stage.label}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{stage.day_range}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: stage.color }}>{stage.mortality_pct}%</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MORTALITY</div>
                      </div>
                    </div>
                    <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden', marginBottom: '0.75rem' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: stage.color, width: `${stage.mortality_pct}%`, transition: 'width 0.6s' }}/>
                    </div>
                    <ul className={styles.stageSymptoms}>
                      {stage.symptoms.map((s, si) => (
                        <li key={si} className={styles.stageSymptom}>{s}</li>
                      ))}
                    </ul>
                    <div className={styles.stageBadge} style={{ background: `${stage.color}18`, color: stage.color }}>
                      Risk: {stage.risk}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

