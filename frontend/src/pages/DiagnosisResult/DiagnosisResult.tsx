import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Share2, CheckCircle2, AlertCircle, Calendar, Thermometer,
  Droplets, ArrowLeft, Volume2, VolumeX, MapPin, TrendingDown,
  Activity, ChevronRight, Navigation
} from 'lucide-react';
import clsx from 'clsx';
import styles from './DiagnosisResult.module.css';

const NAGPUR_VETS = [
  { id: 1, name: "Govt. Veterinary Hospital", address: "Ambazari Rd, Nagpur", phone: "+91 712 255 3344", lat: 21.1368, lng: 79.0594, hours: "9 AM–5 PM Mon–Fri" },
  { id: 2, name: "Royal Pet Clinic", address: "Chhatrapati Nagar, Nagpur", phone: "+91 94230 12345", lat: 21.1104, lng: 79.0527, hours: "10 AM–7 PM All days" },
  { id: 3, name: "Precise Pet Clinic", address: "Pratap Nagar, Nagpur", phone: "+91 98230 44567", lat: 21.1247, lng: 79.0401, hours: "9 AM–9 PM" },
  { id: 4, name: "LifeLine Pet Clinic", address: "Nandanvan, Nagpur", phone: "+91 91584 78920", lat: 21.1417, lng: 79.1128, hours: "8 AM–8 PM" },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const DiagnosisResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const raw = location.state?.resultData;
  const originalImage = location.state?.originalImage;

  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [chatId, setChatId] = useState('');
  const [alertStatus, setAlertStatus] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fishCount, setFishCount] = useState(500);
  const [pricePerKg, setPricePerKg] = useState(120);
  const [nearestVet, setNearestVet] = useState(NAGPUR_VETS[0]);

  useEffect(() => { if (!raw) navigate('/diagnose'); }, [raw, navigate]);

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

  if (!raw) return <div>Loading...</div>;

  // ── Normalise API response keys ────────────────────────────────────────────
  // Backend returns: top_predictions, primary_disease, heatmap_image_b64, reasoning
  const predictions: { disease: string; confidence: number }[] =
    raw.top_predictions ?? raw.predictions ?? [];
  const topPrediction = predictions[0] ?? { disease: raw.primary_disease ?? 'Unknown', confidence: raw.confidence ?? 0 };
  const severity: string = raw.severity ?? 'Warning';
  const reasoning: string = raw.reasoning ?? raw.explainability?.reasoning ?? '';
  const heatmapB64: string | null = raw.heatmap_image_b64 ?? raw.explainability?.heatmap_base64 ?? null;
  const treatment = raw.treatment ?? {};
  const medications: string[] = treatment.medicines?.map((m: any) => m.name ?? m) ?? treatment.medications ?? ['Aquaculture compound'];
  const dosage: string = treatment.medicines?.[0]?.dose ?? treatment.dosage ?? '0.05 mg/L';
  const isHealthy = topPrediction.disease === 'Healthy Fish';
  const causes = raw.causes ?? {};
  const biologicalCauses: string[] = causes.biological ?? [];
  const envCauses: string[] = causes.environmental ?? [];
  const similarCases: any[] = raw.similar_cases ?? [];
  const timeline: any[] = raw.action_timeline ?? [];

  // ── Economic ───────────────────────────────────────────────────────────────
  const mortalityRate = severity === 'Critical' ? 0.7 : severity === 'Warning' ? 0.35 : 0.05;
  const estimatedLoss = isHealthy ? 0 : Math.round(fishCount * mortalityRate * 0.5 * pricePerKg);
  const treatmentCost = isHealthy ? 0 : Math.round(fishCount * 8);
  const netSavings = Math.max(0, estimatedLoss - treatmentCost);

  // ── Voice ──────────────────────────────────────────────────────────────────
  const handleVoice = () => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const txt = `Disease detected: ${topPrediction.disease}. Severity: ${severity}. Confidence: ${(topPrediction.confidence * 100).toFixed(0)} percent. ${reasoning}. Contact ${nearestVet.name} at ${nearestVet.phone}.`;
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'en-IN'; u.rate = 0.9;
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
    setIsSpeaking(true);
  };

  // ── Alert ──────────────────────────────────────────────────────────────────
  const handleAlert = async (type: 'sms' | 'telegram') => {
    setAlertStatus('Sending…');
    const msg = `🐟 AquaGuard Report\nDisease: ${topPrediction.disease}\nSeverity: ${severity}\nConfidence: ${(topPrediction.confidence * 100).toFixed(1)}%\nEst. Loss: ₹${estimatedLoss.toLocaleString()}\nNearest Vet: ${nearestVet.name} ${nearestVet.phone}`;
    try {
      const payload = type === 'sms' ? { phone, message: msg } : { chat_id: chatId, message: msg };
      const res = await fetch(`http://localhost:5001/api/alert/${type}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setAlertStatus(`✅ Sent via ${type.toUpperCase()}!`);
      setTimeout(() => setShowModal(false), 2000);
    } catch { setAlertStatus('❌ Failed. Check backend.'); }
  };

  const timelineIcons = [<Thermometer size={16}/>, <Activity size={16}/>, <Droplets size={16}/>, <Calendar size={16}/>];

  return (
    <div className={styles.container}>

      {/* ── Alert Modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={clsx('card', styles.modal)}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>📤 Export & Alert</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Full report including economic loss + nearest vet will be sent.
            </p>
            <div className={styles.inputGroup}>
              <label>📱 Phone (Fast2SMS)</label>
              <input className={styles.input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => handleAlert('sms')}>Send SMS</button>
            </div>
            <div style={{ margin: '1rem 0', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>— OR —</div>
            <div className={styles.inputGroup}>
              <label>✈️ Telegram Chat ID</label>
              <input className={styles.input} value={chatId} onChange={e => setChatId(e.target.value)} placeholder="123456789" />
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => handleAlert('telegram')}>Send Telegram</button>
            </div>
            {alertStatus && <div style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', color: alertStatus.startsWith('✅') ? 'var(--success)' : 'var(--danger)' }}>{alertStatus}</div>}
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className="flex items-center gap-4">
          <button className={styles.backBtn} onClick={() => navigate('/diagnose')}><ArrowLeft size={20}/></button>
          <div>
            <div className={styles.caseId}>CASE #{id} • {new Date().toLocaleDateString('en-IN')}</div>
            <h1 className={styles.title}>{isHealthy ? '✅ Healthy Fish' : `⚠️ ${topPrediction.disease}`}</h1>
          </div>
        </div>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <button className={clsx('btn', isSpeaking ? 'btn-primary' : 'btn-outline')} onClick={handleVoice}>
            {isSpeaking ? <VolumeX size={15}/> : <Volume2 size={15}/>} {isSpeaking ? 'Stop' : 'Read Aloud'}
          </button>
          <button className="btn btn-outline" onClick={() => { setShowModal(true); setAlertStatus(null); }}>
            <Share2 size={15}/> Alert & Export
          </button>
          <button className="btn btn-primary"><CheckCircle2 size={15}/> Approve Plan</button>
        </div>
      </header>

      <div className={styles.mainGrid}>
        {/* ── LEFT ─────────────────────────────────────────────────────── */}
        <div className={styles.leftCol}>

          {/* Image + Grad-CAM */}
          <div className={styles.imageViewer}>
            <img src={originalImage} alt="Fish" className={styles.baseImage} />
            {heatmapB64 && (
              <img src={`data:image/png;base64,${heatmapB64}`} alt="Grad-CAM" className={styles.heatmapOverlay} />
            )}
            <div className={styles.imageOverlayBadge}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: isHealthy ? 'var(--success)' : 'var(--danger)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                {isHealthy ? '● Healthy' : '● Pathogen Detected'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{topPrediction.disease}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {(topPrediction.confidence * 100).toFixed(1)}% confidence
              </div>
            </div>
            {heatmapB64 && (
              <div className={styles.heatmapLegend}>
                <span style={{ fontSize: '0.6rem', color: 'white', fontWeight: 700 }}>GRAD-CAM: LOW</span>
                <div className={styles.legendBar}/>
                <span style={{ fontSize: '0.6rem', color: 'white', fontWeight: 700 }}>HIGH</span>
              </div>
            )}
          </div>

          {/* Confidence Meter */}
          <div className={clsx('card', styles.confidenceCard)}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              AI Confidence Breakdown
            </h3>
            {predictions.slice(0, 3).map((p, i) => (
              <div key={i} style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: i === 0 ? 700 : 400, color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{p.disease}</span>
                  <span style={{ fontWeight: 700, color: i === 0 ? 'var(--brand-primary)' : 'var(--text-secondary)' }}>
                    {(p.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4, transition: 'width 0.6s',
                    width: `${(p.confidence * 100).toFixed(1)}%`,
                    background: i === 0 ? (isHealthy ? 'var(--success)' : severity === 'Critical' ? 'var(--danger)' : 'var(--warning)') : 'var(--border-color)',
                  }}/>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <div className={styles.metaBadge}>Severity: <strong>{severity}</strong></div>
              <div className={styles.metaBadge}>Model: <strong>{raw.model_type ?? 'AI'}</strong></div>
              {raw.translated && <div className={clsx(styles.metaBadge, styles.metaTranslated)}>🌐 Translated</div>}
            </div>
          </div>

          {/* Treatment Timeline */}
          <div className={clsx('card', styles.timelineCard)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Treatment Timeline</h2>
              <span className={styles.durationBadge}>14-DAY PLAN</span>
            </div>
            <div className={styles.timelineStepper}>
              <div className={styles.timelineLine}/>
              {(timeline.length > 0 ? timeline.slice(0, 4) : [
                { day_range: 'Day 1–3', action: 'Thermal Ramp & Isolation' },
                { day_range: 'Day 4–7', action: 'Initial Medication Dosage' },
                { day_range: 'Day 8–10', action: '60% Water Exchange' },
                { day_range: 'Day 11–14', action: 'Recovery Monitoring' },
              ]).map((step: any, i: number) => (
                <div key={i} className={styles.step}>
                  <div className={clsx(styles.stepIcon, i === 0 ? styles.activeStep : styles.pendingStep)}>
                    {timelineIcons[i]}
                  </div>
                  <div className={styles.stepLabel}>{step.day_range ?? step.days ?? `Day ${i*4+1}–${i*4+4}`}</div>
                  <div className={styles.stepTitle}>{step.action ?? step.title ?? ''}</div>
                </div>
              ))}
            </div>
            <div className={styles.infoAlert}>
              <AlertCircle size={16} color="var(--brand-primary)" style={{ flexShrink: 0 }}/>
              <p>{reasoning || 'Begin treatment immediately. Increase aeration by 40% during thermal ramp phase.'}</p>
            </div>
          </div>

          {/* Economic Loss Calculator */}
          {!isHealthy && (
            <div className={clsx('card', styles.economicCard)}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                <TrendingDown size={16} style={{ display: 'inline', marginRight: 6 }}/>
                Economic Loss Estimator
              </h2>
              <div className={styles.ecoInputGrid}>
                <div className={styles.ecoInputGroup}>
                  <label>Total Fish in Pond</label>
                  <input type="number" value={fishCount} onChange={e => setFishCount(+e.target.value)} className={styles.ecoInput}/>
                </div>
                <div className={styles.ecoInputGroup}>
                  <label>Market Price (₹/kg)</label>
                  <input type="number" value={pricePerKg} onChange={e => setPricePerKg(+e.target.value)} className={styles.ecoInput}/>
                </div>
              </div>
              <div className={styles.ecoResultGrid}>
                <div className={clsx(styles.ecoStat, styles.ecoLoss)}>
                  <div className={styles.ecoStatLabel}>Loss Without Treatment</div>
                  <div className={styles.ecoStatValue}>₹{estimatedLoss.toLocaleString('en-IN')}</div>
                  <div className={styles.ecoStatNote}>{Math.round(mortalityRate * 100)}% mortality</div>
                </div>
                <div className={clsx(styles.ecoStat, styles.ecoTreatment)}>
                  <div className={styles.ecoStatLabel}>Treatment Cost</div>
                  <div className={styles.ecoStatValue}>₹{treatmentCost.toLocaleString('en-IN')}</div>
                  <div className={styles.ecoStatNote}>~₹8 per fish</div>
                </div>
                <div className={clsx(styles.ecoStat, styles.ecoSavings)}>
                  <div className={styles.ecoStatLabel}>Net Savings</div>
                  <div className={styles.ecoStatValue}>₹{netSavings.toLocaleString('en-IN')}</div>
                  <div className={styles.ecoStatNote}>Act within 12 hrs</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT ────────────────────────────────────────────────────── */}
        <div className={styles.rightCol}>

          {/* Diagnosis Summary */}
          <div className={clsx('card', styles.summaryCard)}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Diagnosis Summary</h2>
            <div className={styles.severitySection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                <span>SEVERITY</span>
                <span style={{ color: severity === 'Safe' ? 'var(--success)' : severity === 'Warning' ? 'var(--warning)' : 'var(--danger)' }}>
                  {severity.toUpperCase()}
                </span>
              </div>
              <div className={styles.severityBar}>
                <div className={styles.severityFill} style={{
                  width: severity === 'Critical' ? '90%' : severity === 'Warning' ? '55%' : '20%',
                  backgroundColor: severity === 'Safe' ? 'var(--success)' : severity === 'Warning' ? 'var(--warning)' : 'var(--danger)',
                }}/>
              </div>
            </div>

            {biologicalCauses.length > 0 && (
              <div className={styles.obsBox}>
                <div className={styles.obsLabel}>BIOLOGICAL CAUSES</div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  {biologicalCauses.map((c, i) => <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{c}</li>)}
                </ul>
              </div>
            )}

            {envCauses.length > 0 && (
              <div className={styles.obsBox}>
                <div className={styles.obsLabel}>ENVIRONMENTAL TRIGGERS</div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  {envCauses.slice(0, 3).map((c, i) => <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{c}</li>)}
                </ul>
              </div>
            )}

            <div className={styles.obsBox}>
              <div className={styles.obsLabel}>AI REASONING</div>
              <p className={styles.obsText}>{reasoning || 'Visual analysis complete. See confidence breakdown for details.'}</p>
            </div>
          </div>

          {/* Medication */}
          <div className={clsx('card', styles.medsCard)}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Medication Protocol</h2>
            <div className={styles.medBox}>
              <div className={styles.medIconBox}><Activity size={20} color="var(--brand-primary)"/></div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{medications[0]}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Primary Treatment</div>
              </div>
            </div>
            <div className={styles.medRow}><span>Dosage</span><span className={styles.medValue}>{dosage}</span></div>
            <div className={styles.medRow}><span>Frequency</span><span className={styles.medValue}>{treatment.medicines?.[0]?.frequency ?? 'Every 48 hrs'}</span></div>
            <div className={styles.medRow}><span>Duration</span><span className={styles.medValue}>14 days</span></div>
            {!isHealthy && <button className={clsx('btn', styles.orderBtn)}>Order Refill →</button>}
          </div>

          {/* Nearest Vet */}
          {!isHealthy && (
            <div className={clsx('card', styles.vetCard)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: 5, color: 'var(--brand-primary)' }}/>
                  Nearest Vet (Nagpur)
                </h2>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--brand-primary)', background: '#CCFBF1', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>
                  AUTO-DETECTED
                </span>
              </div>
              <div className={styles.vetHighlight}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{nearestVet.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>{nearestVet.address}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--brand-primary)', fontWeight: 600 }}>{nearestVet.phone}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{nearestVet.hours}</div>
              </div>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(nearestVet.name + ' Nagpur')}`}
                target="_blank" rel="noreferrer"
                className="btn btn-outline"
                style={{ width: '100%', display: 'block', textAlign: 'center', marginTop: '0.75rem' }}
              >
                <Navigation size={13} style={{ display: 'inline', marginRight: 5 }}/>Open in Maps
              </a>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => navigate('/map')}>
                View All Nagpur Vets <ChevronRight size={14}/>
              </button>
            </div>
          )}

          {/* Similar Cases */}
          {similarCases.length > 0 && (
            <div className={clsx('card', styles.similarCard)}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Similar Cases</h2>
              {similarCases.map((c: any, i: number) => (
                <div key={i} className={styles.similarRow}>
                  <div className={styles.similarThumb}>🐟</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{c.disease}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{c.outcome ?? 'Resolved with treatment'}</div>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                    {Math.round((c.similarity ?? 0) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
