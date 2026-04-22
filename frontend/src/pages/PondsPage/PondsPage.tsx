import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Droplets, Thermometer, Activity, AlertTriangle,
  CheckCircle2, Clock, BarChart2, RefreshCw, X, Fish,
  ArrowRight, Calendar,
} from 'lucide-react';
import clsx from 'clsx';
import styles from './PondsPage.module.css';

const API = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5001/api';

const POND_META: Record<string, { ph: number; temp: number; do_: number }> = {
  'P-001': { ph: 6.2, temp: 29.4, do_: 4.1 },
  'P-002': { ph: 7.1, temp: 27.8, do_: 6.2 },
  'P-003': { ph: 7.8, temp: 26.1, do_: 8.3 },
  'P-004': { ph: 8.0, temp: 25.5, do_: 9.1 },
};

const STATUS = {
  Critical: { color: 'var(--danger)',  badge: 'critical', icon: <AlertTriangle size={12}/> },
  Warning:  { color: 'var(--warning)', badge: 'warning',  icon: <Clock size={12}/> },
  Safe:     { color: 'var(--success)', badge: 'safe',     icon: <CheckCircle2 size={12}/> },
};

interface Pond {
  pond_id: string; name: string; species: string;
  stock_count: number; risk_score: number;
  risk_level: 'Critical' | 'Warning' | 'Safe';
  lat: number; lng: number; last_updated: string;
}

interface DiagRecord {
  diagnosis_id: string; timestamp: string;
  primary_disease: string; confidence: number; severity: string;
}

export const PondsPage: React.FC = () => {
  const navigate = useNavigate();
  const [ponds,      setPonds]      = useState<Pond[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // History modal state
  const [histPond,   setHistPond]   = useState<Pond | null>(null);
  const [histData,   setHistData]   = useState<DiagRecord[]>([]);
  const [histLoad,   setHistLoad]   = useState(false);

  useEffect(() => {
    setLoading(true); setError(null);
    fetch(`${API}/ponds`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => setPonds(d.ponds || []))
      .catch(e => setError(`Could not load ponds: ${e.message}`))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const openHistory = (pond: Pond) => {
    setHistPond(pond); setHistData([]); setHistLoad(true);
    fetch(`${API}/diagnoses/history?limit=20`)
      .then(r => r.json())
      .then(d => {
        // Filter by pond_id — include unassigned ones too for demo
        const filtered = (d.history || []).filter(
          (h: any) => !h.pond_id || h.pond_id === pond.pond_id
        );
        setHistData(filtered);
      })
      .catch(() => setHistData([]))
      .finally(() => setHistLoad(false));
  };

  const critCount  = ponds.filter(p => p.risk_level === 'Critical').length;
  const warnCount  = ponds.filter(p => p.risk_level === 'Warning').length;
  const safeCount  = ponds.filter(p => p.risk_level === 'Safe').length;
  const totalFish  = ponds.reduce((s, p) => s + (p.stock_count || 0), 0);

  return (
    <div className={styles.container}>

      {/* ── History Modal ─────────────────────────────────────────────── */}
      {histPond && (
        <div className={styles.overlay} onClick={() => setHistPond(null)}>
          <div className={styles.histModal} onClick={e => e.stopPropagation()}>
            <div className={styles.histModalHead}>
              <div>
                <h2 className={styles.histModalTitle}>Diagnosis History</h2>
                <div className={styles.histModalSub}>{histPond.name} · {histPond.species}</div>
              </div>
              <button onClick={() => setHistPond(null)} className={styles.closeBtn}><X size={18}/></button>
            </div>
            <div className={styles.histModalBody}>
              {histLoad ? (
                <div className={styles.loadState}><div className={styles.spinner}/> Loading…</div>
              ) : histData.length === 0 ? (
                <div className={styles.emptyHist}>
                  <Fish size={36} color="var(--border-color)"/>
                  <p>No diagnoses recorded for this pond yet.</p>
                  <button className="btn btn-primary" onClick={() => { setHistPond(null); navigate(`/diagnose?pond=${histPond.pond_id}`); }}>
                    Run First Scan <ArrowRight size={14}/>
                  </button>
                </div>
              ) : (
                histData.map((rec, i) => {
                  const sev = STATUS[rec.severity as keyof typeof STATUS] ?? STATUS.Safe;
                  return (
                    <div key={i} className={styles.histRow}>
                      <div className={styles.histRowLeft} style={{ borderLeft: `3px solid ${sev.color}` }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{rec.primary_disease}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          <Calendar size={10} style={{ display: 'inline', marginRight: 4 }}/>
                          {new Date(rec.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={clsx('badge', sev.badge)}>{sev.icon} {rec.severity}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: sev.color }}>
                          {(rec.confidence * 100).toFixed(1)}%
                        </span>
                        <button
                          className={styles.viewBtn}
                          onClick={() => { setHistPond(null); navigate(`/result/${rec.diagnosis_id}`, { state: { resultData: rec } }); }}
                        >
                          View <ArrowRight size={11}/>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pond Management</h1>
          <p className={styles.subtitle}>Live risk monitoring for all aquaculture ponds — data fetched from backend.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => setRefreshKey(k => k + 1)}>
            <RefreshCw size={14}/> Refresh
          </button>
          <button className="btn btn-primary"><Plus size={14}/> Add Pond</button>
        </div>
      </header>

      {/* Summary */}
      <div className={styles.summaryRow}>
        {[
          { icon: <AlertTriangle size={18}/>, value: critCount,                    label: 'Critical', color: 'var(--danger)',           border: 'var(--danger)' },
          { icon: <Clock size={18}/>,         value: warnCount,                    label: 'Warning',  color: 'var(--warning)',          border: 'var(--warning)' },
          { icon: <CheckCircle2 size={18}/>,  value: safeCount,                    label: 'Healthy',  color: 'var(--success)',          border: 'var(--success)' },
          { icon: <BarChart2 size={18}/>,     value: totalFish.toLocaleString('en-IN'), label: 'Fish', color: 'var(--brand-primary)', border: 'var(--brand-primary)' },
        ].map((s, i) => (
          <div key={i} className={clsx('card', styles.summaryCard)} style={{ borderLeft: `4px solid ${s.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${s.color}18`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadState}><div className={styles.spinner}/> Loading ponds…</div>
      ) : error ? (
        <div className={styles.errorBox}>
          <AlertTriangle size={16}/> {error}
          <button className="btn btn-outline" style={{ marginLeft: '1rem' }} onClick={() => setRefreshKey(k => k + 1)}>Retry</button>
        </div>
      ) : (
        <div className={styles.pondGrid}>
          {ponds.map(pond => {
            const cfg  = STATUS[pond.risk_level] ?? STATUS.Safe;
            const meta = POND_META[pond.pond_id] ?? { ph: 7.5, temp: 27.0, do_: 7.0 };
            return (
              <div key={pond.pond_id} className={clsx('card', styles.pondCard)}>

                {/* Card Header */}
                <div className={styles.pondHead} style={{ borderBottom: `3px solid ${cfg.color}` }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.1rem' }}>{pond.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{pond.species}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {(pond.stock_count || 0).toLocaleString()} fish stocked
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                    <span className={clsx('badge', cfg.badge)} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      {cfg.icon} {pond.risk_level}
                    </span>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>
                      {new Date(pond.last_updated).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className={styles.metricsGrid}>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>pH</div>
                    <div className={styles.metricValue} style={{ color: meta.ph < 6.5 || meta.ph > 8.5 ? 'var(--danger)' : 'var(--success)' }}>{meta.ph}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}><Thermometer size={10}/> °C</div>
                    <div className={styles.metricValue}>{meta.temp}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}><Droplets size={10}/> DO</div>
                    <div className={styles.metricValue} style={{ color: meta.do_ < 5 ? 'var(--danger)' : 'var(--success)' }}>{meta.do_}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}><Activity size={10}/> Risk</div>
                    <div className={styles.metricValue} style={{ color: cfg.color }}>{pond.risk_score}</div>
                  </div>
                </div>

                {/* Risk Bar */}
                <div style={{ margin: '0.75rem 0 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    <span>DISEASE RISK</span>
                    <span style={{ color: cfg.color }}>{pond.risk_score}/100</span>
                  </div>
                  <div style={{ height: 7, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, background: cfg.color, width: `${pond.risk_score}%`, transition: 'width 0.6s' }}/>
                  </div>
                </div>

                {/* Actions */}
                <div className={styles.pondActions}>
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1, fontSize: '0.78rem' }}
                    onClick={() => openHistory(pond)}
                  >
                    History
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '0.78rem' }}
                    onClick={() => navigate(`/diagnose?pond=${pond.pond_id}`)}
                  >
                    Scan Now <ArrowRight size={13}/>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Pond card */}
          <div className={clsx('card', styles.addCard)} onClick={() => {}}>
            <Plus size={24} color="var(--text-secondary)"/>
            <div style={{ fontWeight: 600, marginTop: '0.75rem', marginBottom: '0.25rem' }}>Add New Pond</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Register a pond for live monitoring</div>
          </div>
        </div>
      )}
    </div>
  );
};
