import React from 'react';
import { Download, Plus, CheckCircle2, AlertTriangle, Activity, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import styles from './Dashboard.module.css';

const MOCK_CHART_DATA = [
  { time: '00:00', value: 45 },
  { time: '02:00', value: 55 },
  { time: '04:00', value: 70 },
  { time: '06:00', value: 48 },
  { time: '08:00', value: 85 },
  { time: '10:00', value: 65 },
  { time: '12:00', value: 68 },
  { time: '14:00', value: 58 },
  { time: '16:00', value: 45 },
  { time: '18:00', value: 65 },
  { time: '20:00', value: 90 },
  { time: '22:00', value: 68 },
];

const OUTBREAK_ZONES = [
  { zone: 'Ambazari Lake Zone', risk: 82, level: 'critical' },
  { zone: 'Futala Lake Area',   risk: 54, level: 'warning' },
  { zone: 'Gorewada Reservoir', risk: 34, level: 'warning' },
  { zone: 'Nag River Basin',    risk: 18, level: 'safe' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>System Overview</h1>
          <p className={styles.subtitle}>Real-time aquatic stability and analysis status.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-outline"><Download size={16} /> Export Report</button>
          <button className="btn btn-primary"><Plus size={16} /> New Analysis</button>
        </div>
      </header>

      <div className={styles.topRow}>
        {/* Metric Cards */}
        <div className={clsx('card', styles.metricCard)}>
          <div className="flex justify-between items-start">
            <div className={styles.metricLabel}>pH Level</div>
            <span className="badge safe">STABLE</span>
          </div>
          <div className={styles.metricValue}>
            8.2 <span className={styles.metricUnit}>pH</span>
          </div>
          <div className={clsx(styles.metricTrend, styles.trendUp)}>
            ↗ 0.1 vs yesterday
          </div>
        </div>

        <div className={clsx('card', styles.metricCard)}>
          <div className="flex justify-between items-start">
            <div className={styles.metricLabel}>Salinity</div>
            <span className="badge safe">OPTIMAL</span>
          </div>
          <div className={styles.metricValue}>
            35.4 <span className={styles.metricUnit}>ppt</span>
          </div>
          <div className={clsx(styles.metricTrend, styles.trendNeutral)}>
            <CheckCircle2 size={14} /> Perfect range
          </div>
        </div>

        <div className={clsx('card', styles.metricCard)}>
          <div className="flex justify-between items-start">
            <div className={styles.metricLabel}>Oxygen (DO)</div>
            <span className="badge warning">WARNING</span>
          </div>
          <div className={clsx(styles.metricValue, styles.textWarning)}>
            6.8 <span className={styles.metricUnit}>mg/L</span>
          </div>
          <div className={clsx(styles.metricTrend, styles.trendDown)}>
            ↘ Low saturation
          </div>
        </div>
        
        {/* Pending Queue List */}
        <div className={clsx('card', styles.queueCard)}>
          <h3 className={styles.cardTitle}>Pending Analyses</h3>
          
          <div className={styles.queueItem}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
              <div className={styles.queueName}>Sample #7482-A</div>
              <div className={styles.queueTime}>12m ago</div>
            </div>
            <div className={styles.queueLoc}>Oceania Marine Park - Sector 4</div>
            <div className="flex justify-between items-center mt-2">
              <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '75%', backgroundColor: '#38BDF8' }}></div></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', marginLeft: '1rem' }}>75%</div>
            </div>
          </div>
          
          <div className={styles.queueItem}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
              <div className={styles.queueName}>Sample #7483-B</div>
              <div className={styles.queueTime}>34m ago</div>
            </div>
            <div className={styles.queueLoc}>Blue Lagoon Research Hub</div>
            <div className="flex justify-between items-center mt-2">
              <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '15%' }}></div></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '1rem' }}>In Queue</div>
            </div>
          </div>

          <button className={styles.viewAllBtn}>View All Queue</button>
        </div>
      </div>

      <div className={styles.bottomRow}>
        {/* Chart */}
        <div className={clsx('card', styles.chartCard)}>
          <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
            <div>
              <h3 className={styles.cardTitle}>24h System Stability Trend</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Composite sensor performance over time.</p>
            </div>
            <div className="flex gap-4" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-2">
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--brand-primary)' }}></div> Stability
              </div>
              <div className="flex items-center gap-2">
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--brand-secondary)' }}></div> Flow Rate
              </div>
            </div>
          </div>
          
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} />
                <Bar dataKey="value" fill="#88B2B3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={clsx('card', styles.activityCard)}>
          <h3 className={styles.cardTitle}>Recent Activity</h3>
          
          <div className={styles.activityItem}>
            <div className={clsx(styles.activityIcon, styles.bgTeal)}>
              <CheckCircle2 size={16} color="var(--brand-primary)" />
            </div>
            <div>
              <div className={styles.activityTitle}>Report Finalized</div>
              <div className={styles.activityDesc}>Coral Nursery growth analysis completed by AI model Alpha.</div>
              <div className={styles.activityTime}>2 hours ago</div>
            </div>
          </div>
          
          <div className={styles.activityItem}>
            <div className={clsx(styles.activityIcon, styles.bgBlue)}>
              <Activity size={16} color="#0EA5E9" />
            </div>
            <div>
              <div className={styles.activityTitle}>Sensor Calibrated</div>
              <div className={styles.activityDesc}>DO sensor in Tank 7-B re-calibrated remotely.</div>
              <div className={styles.activityTime}>5 hours ago</div>
            </div>
          </div>
          
          <div className={styles.activityItem}>
            <div className={clsx(styles.activityIcon, styles.bgRed)}>
              <AlertTriangle size={16} color="var(--danger)" />
            </div>
            <div>
              <div className={styles.activityTitle}>System Warning</div>
              <div className={styles.activityDesc}>Unexpected nitrate spike detected in Holding Tank 12.</div>
              <div className={styles.activityTime}>Yesterday</div>
            </div>
          </div>
        </div>
      </div>

      {/* Outbreak Prediction Widget */}
      <div className={clsx('card', styles.outbreakCard)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 className={styles.cardTitle}>⚠️ Regional Outbreak Prediction — Nagpur</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI-estimated disease outbreak risk by geographic zone.</p>
          </div>
          <span className="badge critical">LIVE MONITORING</span>
        </div>
        <div className={styles.outbreakGrid}>
          {OUTBREAK_ZONES.map((z, i) => (
            <div key={i} className={clsx(styles.outbreakZone, styles[`outbreak_${z.level}`])}>
              <div className={styles.outbreakZoneName}><MapPin size={12} /> {z.zone}</div>
              <div className={styles.outbreakBar}>
                <div className={styles.outbreakFill} style={{ width: `${z.risk}%`, background: z.level === 'critical' ? 'var(--danger)' : z.level === 'warning' ? 'var(--warning)' : 'var(--success)' }} />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: z.level === 'critical' ? 'var(--danger)' : z.level === 'warning' ? 'var(--warning)' : 'var(--success)' }}>
                {z.risk}/100
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
