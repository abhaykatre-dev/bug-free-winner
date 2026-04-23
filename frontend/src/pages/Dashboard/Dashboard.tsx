import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Fish, AlertTriangle, CheckCircle2, Clock, TrendingDown,
  Activity, ArrowRight, Microscope, RefreshCw, MapPin,
  ThumbsUp, ThumbsDown, Calendar, Pill, ShieldAlert, WifiOff, Zap,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { getApprovedPlans, getAllCachedResults, type ApprovedPlan } from '../../hooks/useOfflineSync';
import styles from './Dashboard.module.css';

const API = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5001/api';

const SEV_CONFIG: Record<string, { color: string; bg: string; badge: string; icon: React.ReactNode }> = {
  Critical: { color: 'var(--danger)',  bg: '#FEF2F2', badge: 'critical', icon: <AlertTriangle size={14}/> },
  Warning:  { color: 'var(--warning)', bg: '#FFFBEB', badge: 'warning',  icon: <Clock size={14}/> },
  Mild:     { color: '#F59E0B',        bg: '#FFFBEB', badge: 'warning',  icon: <Clock size={14}/> },
  Safe:     { color: 'var(--success)', bg: '#F0FDF4', badge: 'safe',     icon: <CheckCircle2 size={14}/> },
};

interface DiagnosisRecord {
  diagnosis_id: string;
  timestamp: string;
  primary_disease: string;
  confidence: number;
  severity: string;
  reasoning: string;
  causes: { biological?: string[]; environmental?: string[] };
  treatment: { medicines?: any[]; preventive_steps?: string[]; disclaimer?: string };
  action_timeline: any[];
  economic_loss: any;
  top_predictions: { disease: string; confidence: number }[];
  pond_id: string | null;
}

interface Zone { zone: string; risk: number; level: string; dominant_disease: string | null; case_count: number }

// DO / DO NOT rules per disease class
const JOURNEY_RULES: Record<string, { dos: string[]; donts: string[] }> = {
  default: {
    dos: [
      'Isolate affected fish immediately to a quarantine tank',
      'Test and correct water quality — pH 7–8, DO ≥ 5 mg/L',
      'Begin prescribed medication at recommended dosage',
      'Increase aeration by 30–40% during treatment',
      'Monitor and log water parameters daily',
    ],
    donts: [
      'Do NOT introduce new fish during the outbreak period',
      'Do NOT overfeed — excess feed degrades water quality fast',
      'Do NOT stop medication early, even if fish look recovered',
      'Do NOT share nets or equipment between healthy and infected ponds',
      'Do NOT ignore secondary symptoms — escalate if no improvement in 72 hrs',
    ],
  },
  'Healthy Fish': {
    dos: [
      'Continue weekly water quality checks (pH, ammonia, DO)',
      'Quarantine new stock for 14 days before introducing',
      'Maintain feeding schedule and stocking density',
      'Clean pond banks and remove dead vegetation',
    ],
    donts: [
      'Do NOT neglect routine monitoring even when fish appear healthy',
      'Do NOT add untested fish to the pond without quarantine',
      'Do NOT allow runoff from agricultural fields into the pond',
    ],
  },
};

function getJourneyRules(disease: string) {
  return JOURNEY_RULES[disease] || JOURNEY_RULES['default'];
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [history,   setHistory]   = useState<DiagnosisRecord[]>([]);
  const [zones,     setZones]     = useState<Zone[]>([]);
  const [selected,  setSelected]  = useState<DiagnosisRecord | null>(null);
  const [loadingH,  setLoadingH]  = useState(true);
  const [loadingZ,  setLoadingZ]  = useState(true);
  const [refreshK,  setRefreshK]  = useState(0);
  const [approvedPlans, setApprovedPlans] = useState<ApprovedPlan[]>([]);
  const [isOnline, setIsOnline]   = useState(navigator.onLine);

  // Load approved plans from localStorage on mount (always fresh)
  useEffect(() => {
    setApprovedPlans(getApprovedPlans());
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  useEffect(() => {
    setLoadingH(true);
    fetch(`${API}/diagnoses/history?limit=20`)
      .then(r => r.json())
      .then(d => { setHistory(d.history || []); if (d.history?.length) setSelected(d.history[0]); })
      .catch(() => {
        // Offline fallback: use cached results
        const cached = getAllCachedResults();
        const fallback: DiagnosisRecord[] = cached.map(c => ({
          ...c.result,
          timestamp: new Date(c.cachedAt).toISOString(),
        }));
        setHistory(fallback);
        if (fallback.length) setSelected(fallback[0]);
      })
      .finally(() => setLoadingH(false));
  }, [refreshK]);

  useEffect(() => {
    setLoadingZ(true);
    fetch(`${API}/outbreak-summary`)
      .then(r => r.json())
      .then(d => setZones(d.zones || []))
      .catch(() => {})
      .finally(() => setLoadingZ(false));
  }, [refreshK]);

  // Summary stats derived from history
  const total    = history.length;
  const critical = history.filter(h => h.severity === 'Critical').length;
  const healthy  = history.filter(h => h.primary_disease === 'Healthy Fish').length;
  const avgConf  = total ? Math.round(history.reduce((s, h) => s + h.confidence, 0) / total * 100) : 0;

  const rules = selected ? getJourneyRules(selected.primary_disease) : null;
  const cfg   = selected ? (SEV_CONFIG[selected.severity] ?? SEV_CONFIG.Safe) : null;

  // Recent scans = last 6 from history
  const recentScans = history.slice(0, 6);

  // Relative time helper
  const timeAgo = (iso: string) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60)  return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Auto-refresh every 30 s
  const refreshRef = useRef<any>(null);
  useEffect(() => {
    refreshRef.current = setInterval(() => setRefreshK(k => k + 1), 30_000);
    return () => clearInterval(refreshRef.current);
  }, []);

  return (
    <div className={styles.container}>

      {/* ── Welcome Bar ─────────────────────────────────────────────── */}
      <div className={styles.welcomeBar}>
        <div>
          <h1 className={styles.welcomeTitle}>
            Welcome back, {user?.name?.split(' ')[0] ?? 'Farmer'}
          </h1>
          <p className={styles.welcomeSub}>
            {total > 0
              ? `You have ${total} recorded diagnoses · ${critical} critical case${critical !== 1 ? 's' : ''} detected`
              : 'No diagnoses yet — upload a fish photo to get started'}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => setRefreshK(k => k + 1)}>
            <RefreshCw size={15}/> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/diagnose')}>
            <Microscope size={15}/> New Scan
          </button>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      <div className={styles.statsRow}>
        {[
          { icon: <Fish size={20}/>,         value: total,        label: 'Total Scans',       sub: 'All time',           color: 'var(--brand-primary)' },
          { icon: <AlertTriangle size={20}/>, value: critical,     label: 'Critical Cases',    sub: 'Need action',        color: 'var(--danger)' },
          { icon: <CheckCircle2 size={20}/>,  value: healthy,      label: 'Healthy Results',   sub: 'No disease found',   color: 'var(--success)' },
          { icon: <Activity size={20}/>,      value: `${avgConf}%`, label: 'Avg Confidence',  sub: 'Model accuracy',     color: '#6366F1' },
        ].map((s, i) => (
          <div key={i} className={clsx('card', styles.statCard)}>
            <div className={styles.statIcon} style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
            <div>
              <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statSub}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Scans Strip ───────────────────────────────────────── */}
      <div>
        <div className="flex justify-between items-center" style={{ marginBottom: '0.85rem' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
            <Zap size={15} style={{ display:'inline', marginRight: 5, color:'var(--brand-primary)' }}/>
            Recent Scans
            {!loadingH && (
              <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                auto-refreshes every 30s
              </span>
            )}
          </h2>
          <button className="btn btn-outline" style={{ fontSize: '0.75rem' }} onClick={() => setRefreshK(k => k + 1)}>
            <RefreshCw size={13}/> Refresh
          </button>
        </div>

        {loadingH ? (
          <div className={styles.recentSkeletonRow}>
            {[...Array(6)].map((_, i) => <div key={i} className={styles.recentSkeleton}/>)}
          </div>
        ) : recentScans.length === 0 ? (
          <div className={styles.recentEmpty}>
            <Fish size={24} color="var(--border-color)"/>
            <span>No scans yet — run your first scan to see results here</span>
            <button className="btn btn-primary" style={{ fontSize: '0.78rem' }} onClick={() => navigate('/diagnose')}>
              <Microscope size={13}/> Start Scan
            </button>
          </div>
        ) : (
          <div className={styles.recentScansRow}>
            {recentScans.map(rec => {
              const isHealthyRec = rec.primary_disease?.toLowerCase().includes('healthy');
              const c = isHealthyRec ? SEV_CONFIG.Safe : (SEV_CONFIG[rec.severity] ?? SEV_CONFIG.Safe);
              return (
                <div
                  key={rec.diagnosis_id}
                  className={styles.recentCard}
                  onClick={() => navigate(`/result/${rec.diagnosis_id}`, {
                    state: { resultData: rec, originalImage: null }
                  })}
                >
                  {/* Colour top bar */}
                  <div className={styles.recentTopBar} style={{ background: c.color }}/>

                  <div className={styles.recentBody}>
                    <div className={styles.recentDisease}>{rec.primary_disease}</div>

                    <div className={styles.recentMeta}>
                      <span className={clsx('badge', c.badge)} style={{ fontSize: '0.6rem' }}>
                        {isHealthyRec ? 'Safe' : rec.severity}
                      </span>
                      <span className={styles.recentConf}>
                        {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>

                    <div className={styles.recentTime}>
                      <Clock size={11}/> {timeAgo(rec.timestamp)}
                    </div>

                    {rec.pond_id && (
                      <div className={styles.recentPond}>
                        Pond #{rec.pond_id}
                      </div>
                    )}
                  </div>

                  <div className={styles.recentCta}>
                    View <ArrowRight size={11}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Main 2-col Layout ───────────────────────────────────────── */}
      <div className={styles.mainGrid}>

        {/* LEFT — History List */}
        <div className={styles.historyCol}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <h2 className={styles.sectionTitle}>Analysis History</h2>
            {!loadingH && <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{total} records</span>}
          </div>

          {loadingH ? (
            <div className={styles.loadState}><div className={styles.spinner}/> Loading history…</div>
          ) : history.length === 0 ? (
            <div className={styles.emptyState}>
              <Fish size={40} color="var(--border-color)"/>
              <p>No analysis history yet.</p>
              <button className="btn btn-primary" onClick={() => navigate('/diagnose')}>Run First Scan</button>
            </div>
          ) : (
            <div className={styles.historyList}>
              {history.map(rec => {
                const isHealthyRec = rec.primary_disease?.toLowerCase().includes('healthy');
                const c = isHealthyRec ? SEV_CONFIG.Safe : (SEV_CONFIG[rec.severity] ?? SEV_CONFIG.Safe);
                const isActive = selected?.diagnosis_id === rec.diagnosis_id;
                return (
                  <div
                    key={rec.diagnosis_id}
                    className={clsx(styles.historyCard, isActive && styles.historyCardActive)}
                    onClick={() => setSelected(rec)}
                  >
                    <div className={styles.hCardLeft} style={{ borderLeft: `3px solid ${c.color}` }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem' }}>
                        {rec.primary_disease}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        {relativeTime(rec.timestamp)} · {rec.pond_id ?? 'Unknown pond'}
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className={clsx('badge', c.badge)} style={{ fontSize: '0.6rem' }}>
                          {isHealthyRec ? 'Safe' : rec.severity}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {(rec.confidence * 100).toFixed(1)}% conf
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <div className={styles.hCardArrow}><ArrowRight size={14} color="var(--brand-primary)"/></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Journey Panel */}
        <div className={styles.journeyCol}>
          {!selected ? (
            <div className={clsx('card', styles.emptyJourney)}>
              <Fish size={48} color="var(--border-color)"/>
              <p style={{ fontWeight: 600, marginTop: '1rem' }}>Select a diagnosis to view the full journey</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Click any record on the left to see step-by-step recovery actions
              </p>
            </div>
          ) : (
            <div className={styles.journey}>

              {/* Journey Header */}
              <div className={clsx('card', styles.journeyHeader)} style={{ borderLeft: `4px solid ${cfg!.color}` }}>
                <div className="flex justify-between items-start" style={{ marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
                      Diagnosis · {new Date(selected.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: cfg!.color, margin: 0 }}>
                      {selected.primary_disease}
                    </h2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: cfg!.color }}>
                      {(selected.confidence * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CONFIDENCE</div>
                  </div>
                </div>
                {/* Confidence bar */}
                <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: cfg!.color, width: `${(selected.confidence * 100).toFixed(1)}%`, transition: 'width 0.5s' }}/>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className={clsx('badge', cfg!.badge)}>{cfg!.icon} {selected.severity}</span>
                  {selected.pond_id && <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>Pond: {selected.pond_id}</span>}
                  <button className={styles.viewFullBtn} onClick={() => navigate(`/result/${selected.diagnosis_id}`, { state: { resultData: selected, originalImage: null } })}>
                    Full Report <ArrowRight size={12}/>
                  </button>
                </div>
              </div>

              {/* AI Reasoning */}
              {selected.reasoning && (
                <div className={clsx('card', styles.journeySection)}>
                  <div className={styles.sectionHead}><Microscope size={15}/> AI Reasoning</div>
                  <p className={styles.reasoningText}>{selected.reasoning}</p>
                </div>
              )}

              {/* DO / DON'T */}
              <div className={styles.doGrid}>
                <div className={clsx('card', styles.doCard)}>
                  <div className={styles.doHead} style={{ color: 'var(--success)' }}>
                    <ThumbsUp size={15}/> What To Do
                  </div>
                  <ul className={styles.doList}>
                    {rules!.dos.map((d, i) => (
                      <li key={i} className={styles.doItem}>
                        <div className={styles.doBullet} style={{ background: '#DCFCE7', color: 'var(--success)' }}>✓</div>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={clsx('card', styles.dontCard)}>
                  <div className={styles.doHead} style={{ color: 'var(--danger)' }}>
                    <ThumbsDown size={15}/> What NOT To Do
                  </div>
                  <ul className={styles.doList}>
                    {rules!.donts.map((d, i) => (
                      <li key={i} className={styles.doItem}>
                        <div className={styles.doBullet} style={{ background: '#FEE2E2', color: 'var(--danger)' }}>✗</div>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Treatment Timeline */}
              {selected.action_timeline.length > 0 && (
                <div className={clsx('card', styles.journeySection)}>
                  <div className={styles.sectionHead}><Calendar size={15}/> Recovery Timeline</div>
                  <div className={styles.timeline}>
                    {selected.action_timeline.slice(0, 5).map((step: any, i: number) => (
                      <div key={i} className={styles.timelineStep}>
                        <div className={styles.timelineDot} style={{ background: i === 0 ? 'var(--brand-primary)' : 'var(--border-color)', color: i === 0 ? 'white' : 'var(--text-secondary)' }}>
                          {i + 1}
                        </div>
                        <div className={styles.timelineBody}>
                          <div className={styles.timelineDay}>{step.day_range ?? step.days ?? `Day ${i * 3 + 1}–${i * 3 + 3}`}</div>
                          <div className={styles.timelineAction}>{step.action ?? step.title ?? ''}</div>
                          {step.details && <div className={styles.timelineDetail}>{step.details}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medication */}
              {selected.treatment?.medicines && selected.treatment.medicines.length > 0 && (
                <div className={clsx('card', styles.journeySection)}>
                  <div className={styles.sectionHead}><Pill size={15}/> Prescribed Medication</div>
                  {selected.treatment.medicines.slice(0, 2).map((m: any, i: number) => (
                    <div key={i} className={styles.medRow}>
                      <div className={styles.medName}>{typeof m === 'string' ? m : m.name}</div>
                      {m.dose && <div className={styles.medDose}>{m.dose}</div>}
                      {m.frequency && <div className={styles.medFreq}>{m.frequency}</div>}
                    </div>
                  ))}
                  {selected.treatment.disclaimer && (
                    <div className={styles.disclaimer}><ShieldAlert size={13}/> {selected.treatment.disclaimer}</div>
                  )}
                </div>
              )}

              {/* Economic Loss */}
              {selected.economic_loss && (
                <div className={clsx('card', styles.journeySection)}>
                  <div className={styles.sectionHead}><TrendingDown size={15}/> Estimated Economic Impact</div>
                  <div className={styles.econGrid}>
                    <div className={styles.econStat} style={{ borderLeft: '3px solid var(--danger)' }}>
                      <div className={styles.econLabel}>Loss Without Treatment</div>
                      <div className={styles.econValue} style={{ color: 'var(--danger)' }}>
                        ₹{(selected.economic_loss.revenue_loss_day14_inr ?? 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className={styles.econStat} style={{ borderLeft: '3px solid var(--success)' }}>
                      <div className={styles.econLabel}>Net Saving (if treated)</div>
                      <div className={styles.econValue} style={{ color: 'var(--success)' }}>
                        ₹{(selected.economic_loss.net_saving_inr ?? 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Outbreak Widget (bottom, full-width, live from DB) ────── */}
      <div className={clsx('card', styles.outbreakCard)}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3 className={styles.sectionTitle}>
              <MapPin size={15} style={{ display: 'inline', marginRight: 6, color: 'var(--brand-primary)' }}/>
              Regional Outbreak Risk — Nagpur
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Real-time risk derived from all recorded diagnoses across geographic zones
            </p>
          </div>
          <span className="badge critical" style={{ fontSize: '0.65rem' }}>LIVE</span>
        </div>
        {loadingZ ? (
          <div className={styles.loadState}><div className={styles.spinner}/></div>
        ) : (
          <div className={styles.outbreakGrid}>
            {zones.map((z, i) => {
              const c = z.level === 'critical' ? 'var(--danger)' : z.level === 'warning' ? 'var(--warning)' : 'var(--success)';
              return (
                <div key={i} className={styles.zoneCard}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{z.zone}</div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: c }}>{z.risk}/100</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden', marginBottom: '0.4rem' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: c, width: `${z.risk}%`, transition: 'width 0.6s' }}/>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {z.case_count} case{z.case_count !== 1 ? 's' : ''}
                    {z.dominant_disease ? ` · ${z.dominant_disease}` : ' · No data'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Approved Treatment Plans ──────────────────────────────── */}
      {approvedPlans.length > 0 && (
        <div className={styles.approvedSection}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <h2 className={styles.sectionTitle}>
              <CheckCircle2 size={16} color="var(--success)" style={{ display: 'inline', marginRight: 6 }}/>
              Approved Treatment Plans
            </h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {approvedPlans.length} active plan{approvedPlans.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className={styles.approvedGrid}>
            {approvedPlans.map(plan => {
              const sevCfg = SEV_CONFIG[plan.severity] ?? SEV_CONFIG.Safe;
              const totalSteps = 5;
              const done = plan.completedSteps?.length ?? 0;
              const pct  = Math.round((done / totalSteps) * 100);
              return (
                <div key={plan.diagnosisId} className={styles.approvedCard}>
                  <div className="flex justify-between items-start" style={{ marginBottom: '0.6rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.15rem' }}>{plan.disease}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                        Approved {new Date(plan.approvedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </div>
                    </div>
                    <span className={clsx('badge', sevCfg.badge)} style={{ fontSize: '0.62rem' }}>{plan.severity}</span>
                  </div>

                  {/* Recovery progress */}
                  <div style={{ marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      <span>Recovery Progress</span>
                      <span style={{ fontWeight: 700, color: sevCfg.color }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: pct === 100 ? 'var(--success)' : sevCfg.color, width: `${pct}%`, transition: 'width 0.5s' }}/>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Confidence: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(plan.confidence * 100)}%</strong>
                    </div>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }}
                      onClick={() => navigate(`/result/${plan.diagnosisId}`)}
                    >
                      Track <ArrowRight size={11}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Offline mode notice */}
      {!isOnline && (
        <div className={styles.offlineNotice}>
          <WifiOff size={14}/>
          You are offline. Showing cached data. Translation, Telegram alerts, and map features are disabled.
        </div>
      )}

    </div>
  );
};
