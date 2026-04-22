import React from 'react';
import styles from './TrustMeter.module.css';

interface TrustMeterProps {
  confidence: number;   // 0–1
  isHealthy: boolean;
  severity: string;     // 'Safe' | 'Warning' | 'Critical'
  t?: (k: string) => string;
}

export const TrustMeter: React.FC<TrustMeterProps> = ({
  confidence, isHealthy, severity, t = k => k,
}) => {
  const pct = Math.round(confidence * 100);
  const angle = (pct / 100) * 180;

  // Color logic: green ONLY for healthy fish. Disease = severity-based.
  const color = isHealthy
    ? '#10B981'                                     // always green
    : severity === 'Critical' ? '#EF4444'           // red
    : severity === 'Warning'  ? '#F97316'           // orange
    : '#F59E0B';                                    // yellow for mild

  const level = isHealthy
    ? t('Safe to follow treatment')
    : severity === 'Critical' ? t('Consult a vet')
    : t('Proceed with caution');

  const badge = isHealthy ? 'safe' : severity === 'Critical' ? 'danger' : 'warn';
  const trustLabel = isHealthy ? 'High (Healthy)' : severity === 'Critical' ? 'High Confidence — Disease Confirmed' : 'Medium';

  // SVG arc
  const cx = 80, cy = 80, r = 60;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcX  = (deg: number) => cx + r * Math.cos(toRad(180 + deg));
  const arcY  = (deg: number) => cy + r * Math.sin(toRad(180 + deg));
  const bgPath = `M ${arcX(0)} ${arcY(0)} A ${r} ${r} 0 0 1 ${arcX(180)} ${arcY(180)}`;
  const fgPath = angle > 0
    ? `M ${arcX(0)} ${arcY(0)} A ${r} ${r} 0 ${angle > 180 ? 1 : 0} 1 ${arcX(angle)} ${arcY(angle)}`
    : '';

  return (
    <div className={styles.wrap}>
      <svg viewBox="0 0 160 90" className={styles.gauge}>
        <path d={bgPath} fill="none" stroke="#E2E8F0" strokeWidth="14" strokeLinecap="round"/>
        {fgPath && (
          <path d={fgPath} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
            style={{ transition: 'stroke 0.4s' }}/>
        )}
        <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="800" fill={color}>{pct}%</text>
        <text x="18"  y="92" textAnchor="middle" fontSize="9" fill="#94A3B8">0%</text>
        <text x="142" y="92" textAnchor="middle" fontSize="9" fill="#94A3B8">100%</text>
      </svg>
      <div className={styles.label} style={{ color }}>{level}</div>
      <div className={`${styles.badge} ${styles[badge]}`}>
        {t('Trust Level')}: {trustLabel}
      </div>
    </div>
  );
};
