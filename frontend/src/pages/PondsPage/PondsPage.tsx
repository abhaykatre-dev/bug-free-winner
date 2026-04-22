import React, { useState } from 'react';
import { Plus, Droplets, Thermometer, Activity, AlertTriangle, CheckCircle2, Clock, BarChart2 } from 'lucide-react';
import clsx from 'clsx';
import styles from './PondsPage.module.css';

const MOCK_PONDS = [
  {
    id: 'P-001',
    name: 'Pond Alpha',
    location: 'Zone A – North Bank',
    species: 'Rohu (Labeo rohita)',
    fishCount: 1200,
    area_m2: 800,
    status: 'Critical' as const,
    ph: 6.2, temp: 29.4, do: 4.1, salinity: 0.3,
    lastScan: '2 hrs ago',
    image: '/sample_bacterial_red.jpg',
  },
  {
    id: 'P-002',
    name: 'Pond Beta',
    location: 'Zone B – East Side',
    species: 'Catla (Catla catla)',
    fishCount: 850,
    area_m2: 600,
    status: 'Warning' as const,
    ph: 7.1, temp: 27.8, do: 6.2, salinity: 0.2,
    lastScan: '5 hrs ago',
    image: '/sample_fungal.jpg',
  },
  {
    id: 'P-003',
    name: 'Pond Gamma',
    location: 'Zone A – South Side',
    species: 'Common Carp (Cyprinus carpio)',
    fishCount: 2100,
    area_m2: 1200,
    status: 'Safe' as const,
    ph: 7.8, temp: 26.1, do: 8.3, salinity: 0.1,
    lastScan: '1 hr ago',
    image: '/sample_healthy.jpg',
  },
  {
    id: 'P-004',
    name: 'Pond Delta',
    location: 'Zone C – Research Wing',
    species: 'Tilapia (Oreochromis niloticus)',
    fishCount: 650,
    area_m2: 400,
    status: 'Safe' as const,
    ph: 8.0, temp: 25.5, do: 9.1, salinity: 0.15,
    lastScan: '30 mins ago',
    image: '/sample_healthy.jpg',
  },
];

const statusConfig = {
  Critical: { color: 'var(--danger)', bg: '#FEF2F2', badge: 'critical', icon: <AlertTriangle size={16} /> },
  Warning:  { color: 'var(--warning)', bg: '#FFFBEB', badge: 'warning', icon: <Clock size={16} /> },
  Safe:     { color: 'var(--success)', bg: '#F0FDF4', badge: 'safe', icon: <CheckCircle2 size={16} /> },
};

export const PondsPage: React.FC = () => {
  const [ponds] = useState(MOCK_PONDS);
  const [selected, setSelected] = useState<typeof MOCK_PONDS[0] | null>(null);

  const critCount = ponds.filter(p => p.status === 'Critical').length;
  const warnCount = ponds.filter(p => p.status === 'Warning').length;
  const safeCount = ponds.filter(p => p.status === 'Safe').length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pond Management</h1>
          <p className={styles.subtitle}>Monitor water quality, disease risk, and fish health across all your ponds.</p>
        </div>
        <button className="btn btn-primary"><Plus size={16} /> Add New Pond</button>
      </header>

      {/* Summary Row */}
      <div className={styles.summaryRow}>
        <div className={clsx('card', styles.summaryCard)} style={{ borderLeft: '4px solid var(--danger)' }}>
          <AlertTriangle size={20} color="var(--danger)" />
          <div>
            <div className={styles.summaryValue} style={{ color: 'var(--danger)' }}>{critCount}</div>
            <div className={styles.summaryLabel}>Critical Ponds</div>
          </div>
        </div>
        <div className={clsx('card', styles.summaryCard)} style={{ borderLeft: '4px solid var(--warning)' }}>
          <Clock size={20} color="var(--warning)" />
          <div>
            <div className={styles.summaryValue} style={{ color: 'var(--warning)' }}>{warnCount}</div>
            <div className={styles.summaryLabel}>Warning Ponds</div>
          </div>
        </div>
        <div className={clsx('card', styles.summaryCard)} style={{ borderLeft: '4px solid var(--success)' }}>
          <CheckCircle2 size={20} color="var(--success)" />
          <div>
            <div className={styles.summaryValue} style={{ color: 'var(--success)' }}>{safeCount}</div>
            <div className={styles.summaryLabel}>Healthy Ponds</div>
          </div>
        </div>
        <div className={clsx('card', styles.summaryCard)} style={{ borderLeft: '4px solid var(--brand-primary)' }}>
          <BarChart2 size={20} color="var(--brand-primary)" />
          <div>
            <div className={styles.summaryValue}>{ponds.reduce((s, p) => s + p.fishCount, 0).toLocaleString()}</div>
            <div className={styles.summaryLabel}>Total Fish</div>
          </div>
        </div>
      </div>

      {/* Pond Grid */}
      <div className={styles.pondGrid}>
        {ponds.map(pond => {
          const cfg = statusConfig[pond.status];
          return (
            <div
              key={pond.id}
              className={clsx('card', styles.pondCard, selected?.id === pond.id && styles.pondCardActive)}
              onClick={() => setSelected(selected?.id === pond.id ? null : pond)}
            >
              <div className={styles.pondImageWrap}>
                <img src={pond.image} alt={pond.name} className={styles.pondImage} />
                <span className={clsx('badge', cfg.badge)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                  {cfg.icon} {pond.status.toUpperCase()}
                </span>
              </div>

              <div className={styles.pondBody}>
                <div className="flex justify-between items-start" style={{ marginBottom: '.5rem' }}>
                  <div>
                    <h3 className={styles.pondName}>{pond.name}</h3>
                    <div className={styles.pondMeta}>{pond.location}</div>
                    <div className={styles.pondMeta}>{pond.species} · {pond.fishCount.toLocaleString()} fish</div>
                  </div>
                  <div style={{ fontSize: '.7rem', color: 'var(--text-secondary)' }}>Last scan: {pond.lastScan}</div>
                </div>

                <div className={styles.metricsGrid}>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>pH</div>
                    <div className={styles.metricValue} style={{ color: pond.ph < 6.5 || pond.ph > 8.5 ? 'var(--danger)' : 'var(--success)' }}>
                      {pond.ph}
                    </div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}><Thermometer size={12} /> Temp</div>
                    <div className={styles.metricValue}>{pond.temp}°C</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}><Droplets size={12} /> DO</div>
                    <div className={styles.metricValue} style={{ color: pond.do < 5 ? 'var(--danger)' : 'var(--success)' }}>
                      {pond.do} mg/L
                    </div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}><Activity size={12} /> Area</div>
                    <div className={styles.metricValue}>{pond.area_m2} m²</div>
                  </div>
                </div>

                {/* Risk Bar */}
                <div style={{ marginTop: '.75rem' }}>
                  <div className="flex justify-between" style={{ fontSize: '.7rem', marginBottom: '.3rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <span>DISEASE RISK SCORE</span>
                    <span style={{ color: cfg.color }}>
                      {pond.status === 'Critical' ? '82/100' : pond.status === 'Warning' ? '54/100' : '18/100'}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      background: cfg.color,
                      width: pond.status === 'Critical' ? '82%' : pond.status === 'Warning' ? '54%' : '18%',
                      transition: 'width .5s',
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
                  <button className="btn btn-outline" style={{ flex: 1, fontSize: '.8rem', padding: '.5rem' }}>View History</button>
                  <button className="btn btn-primary" style={{ flex: 1, fontSize: '.8rem', padding: '.5rem' }}>
                    Scan Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Pond Card */}
        <div className={clsx('card', styles.addPondCard)}>
          <div className={styles.addPondIcon}><Plus size={28} color="var(--text-secondary)" /></div>
          <div style={{ fontWeight: 600, marginBottom: '.4rem' }}>Register New Pond</div>
          <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 160 }}>
            Track water quality and disease risk in a new aquaculture pond
          </div>
        </div>
      </div>
    </div>
  );
};
