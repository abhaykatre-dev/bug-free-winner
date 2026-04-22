import React, { useState } from 'react';
import { Search, Bug, AlertTriangle, FlaskConical, BookOpen } from 'lucide-react';
import clsx from 'clsx';
import styles from './PathogenLibrary.module.css';

// All 7 disease classes from the actual training dataset
const ALL_PATHOGENS = [
  {
    id: 1,
    name: 'Bacterial Red Disease',
    risk: 'High Risk',
    img: '/sample_bacterial_red.jpg',
    causes: 'Aeromonas hydrophila, Pseudomonas spp.',
    symptoms: 'Red lesions, hemorrhagic patches, fin rot, lethargy, and high mortality.',
    treatment: 'Oxytetracycline bath (1 g/100L), potassium permanganate 2 ppm',
    prevention: 'Maintain DO > 6 mg/L, avoid overcrowding, regular water exchange.',
    mortality: '70–90%',
    incubation: '2–5 days',
    authors: ['AJ', 'MK'],
  },
  {
    id: 2,
    name: 'Bacterial Aeromoniasis',
    risk: 'High Risk',
    img: '/sample_aeromoniasis.jpg',
    causes: 'Aeromonas hydrophila, Aeromonas salmonicida',
    symptoms: 'Ulcers, dropsy, pop-eye, reddening at fin bases, abdominal swelling.',
    treatment: 'Ampicillin 50 mg/kg fish weight, salt bath 5 g/L for 10 min',
    prevention: 'Reduce stress, quarantine new stock, keep pH 7.0–8.5.',
    mortality: '60–80%',
    incubation: '3–7 days',
    authors: ['DR'],
  },
  {
    id: 3,
    name: 'Bacterial Gill Disease',
    risk: 'Moderate',
    img: '/sample_bacterial_red.jpg',
    causes: 'Flavobacterium branchiophilum',
    symptoms: 'Gill pallor, rapid respiration, fish gasping at surface, lethargy.',
    treatment: 'Chloramine-T 2–5 ppm flush, benzalkonium chloride 1 ppm',
    prevention: 'Maintain water flow, check nitrite levels, avoid overcrowding.',
    mortality: '40–60%',
    incubation: '4–10 days',
    authors: ['LW', 'TS'],
  },
  {
    id: 4,
    name: 'Fungal Saprolegniasis',
    risk: 'Moderate',
    img: '/sample_fungal.jpg',
    causes: 'Saprolegnia spp., Achlya spp. (water moulds)',
    symptoms: 'White/grey cotton-like tufts on skin, fins, or eggs. Tissue necrosis.',
    treatment: 'Malachite green 0.1 ppm, salt bath 3% for 1 min, potassium permanganate',
    prevention: 'Remove dead fish immediately, treat wounds, avoid mechanical injury.',
    mortality: '30–50%',
    incubation: '3–7 days',
    authors: ['RJ'],
  },
  {
    id: 5,
    name: 'Parasitic Disease',
    risk: 'Moderate',
    img: '/sample_aeromoniasis.jpg',
    causes: 'Ichthyophthirius multifiliis (Ich), Trichodina spp., Gyrodactylus spp.',
    symptoms: 'White spots on body/fins, excess mucus, scratching against objects, flashing.',
    treatment: 'Formalin 25–50 ppm bath, copper sulfate 0.5 ppm, salt bath',
    prevention: 'Quarantine new fish 2 weeks, maintain temperature stability.',
    mortality: '20–40%',
    incubation: '1–5 days',
    authors: ['AJ'],
  },
  {
    id: 6,
    name: 'Viral White Tail Disease',
    risk: 'High Risk',
    img: '/sample_viral.jpg',
    causes: 'Macrobrachium rosenbergii Nodavirus (MrNV) and Extra Small Virus (XSV)',
    symptoms: 'White discolouration of tail/abdomen muscle, lethargy, mass mortality.',
    treatment: 'No cure. Supportive care only. Removal of infected stock.',
    prevention: 'Certified virus-free seed, strict biosecurity, disinfect equipment.',
    mortality: '80–100%',
    incubation: '2–4 days',
    authors: ['MK', 'DR'],
  },
  {
    id: 7,
    name: 'Healthy Fish',
    risk: 'Safe',
    img: '/sample_healthy.jpg',
    causes: 'N/A — No disease detected',
    symptoms: 'Active swimming, clear eyes, intact fins, good appetite, normal colouration.',
    treatment: 'No treatment required. Maintain current water quality standards.',
    prevention: 'Regular monitoring, balanced feed, optimal DO, pH 7.0–8.5.',
    mortality: '<1%',
    incubation: 'N/A',
    authors: ['LW'],
  },
];

export const PathogenLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<typeof ALL_PATHOGENS[0] | null>(null);

  const filtered = ALL_PATHOGENS.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const highRisk = ALL_PATHOGENS.filter(p => p.risk === 'High Risk').length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pathogen Library</h1>
          <p className={styles.subtitle}>
            Complete diagnostic reference for all 7 freshwater fish disease classes in the AquaGuard training dataset.
          </p>
        </div>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search diseases..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className={styles.metricsGrid}>
        <div className={clsx('card', styles.metricCard)}>
          <div className={clsx(styles.metricIcon, styles.bgBlue)}><Bug size={22} color="#0EA5E9" /></div>
          <div>
            <div className={styles.metricLabel}>Disease Classes</div>
            <div className={styles.metricValue}>7</div>
          </div>
        </div>
        <div className={clsx('card', styles.metricCard)}>
          <div className={clsx(styles.metricIcon, styles.bgRed)}><AlertTriangle size={22} color="var(--danger)" /></div>
          <div>
            <div className={styles.metricLabel}>High Risk Classes</div>
            <div className={clsx(styles.metricValue)} style={{ color: 'var(--danger)' }}>{highRisk}</div>
          </div>
        </div>
        <div className={clsx('card', styles.metricCard)}>
          <div className={clsx(styles.metricIcon, styles.bgTeal)}><FlaskConical size={22} color="var(--brand-primary)" /></div>
          <div>
            <div className={styles.metricLabel}>Model Accuracy</div>
            <div className={styles.metricValue}>90%+</div>
          </div>
        </div>
        <div className={clsx('card', styles.metricCard)}>
          <div className={clsx(styles.metricIcon, styles.bgTeal)}><BookOpen size={22} color="var(--brand-primary)" /></div>
          <div>
            <div className={styles.metricLabel}>Training Images</div>
            <div className={styles.metricValue}>3,500+</div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Grid */}
        <div className={styles.pathogenGrid}>
          {filtered.map(pathogen => (
            <div
              key={pathogen.id}
              className={clsx('card', styles.pathogenCard, selected?.id === pathogen.id && styles.cardSelected)}
              onClick={() => setSelected(selected?.id === pathogen.id ? null : pathogen)}
            >
              <div className={styles.cardImage} style={{ backgroundImage: `url(${pathogen.img})` }}>
                <span className={clsx(
                  'badge',
                  pathogen.risk === 'High Risk' ? 'critical' :
                  pathogen.risk === 'Moderate'  ? 'warning' : 'safe'
                )} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                  {pathogen.risk}
                </span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{pathogen.name}</h3>
                <p className={styles.cardDesc}>{pathogen.symptoms.substring(0, 80)}…</p>
                <div className={styles.cardFooter}>
                  <div className={styles.cardStat}>
                    <span className={styles.cardStatLabel}>Mortality</span>
                    <span className={styles.cardStatValue} style={{ color: pathogen.risk === 'High Risk' ? 'var(--danger)' : pathogen.risk === 'Moderate' ? 'var(--warning)' : 'var(--success)' }}>
                      {pathogen.mortality}
                    </span>
                  </div>
                  <div className={styles.cardStat}>
                    <span className={styles.cardStatLabel}>Incubation</span>
                    <span className={styles.cardStatValue}>{pathogen.incubation}</span>
                  </div>
                  <button className={styles.viewBtn}>Details →</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className={clsx('card', styles.detailPanel)}>
            <button className={styles.closeDetail} onClick={() => setSelected(null)}>✕</button>
            <img src={selected.img} alt={selected.name} className={styles.detailImage} />
            <div className={styles.detailBody}>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selected.name}</h2>
                <span className={clsx('badge', selected.risk === 'High Risk' ? 'critical' : selected.risk === 'Moderate' ? 'warning' : 'safe')}>
                  {selected.risk}
                </span>
              </div>

              <DetailRow label="Causes" value={selected.causes} />
              <DetailRow label="Symptoms" value={selected.symptoms} />
              <DetailRow label="Treatment" value={selected.treatment} highlight />
              <DetailRow label="Prevention" value={selected.prevention} />

              <div className={styles.detailStats}>
                <div className={styles.detailStat}>
                  <div className={styles.detailStatLabel}>Mortality Rate</div>
                  <div className={styles.detailStatValue} style={{ color: selected.risk === 'High Risk' ? 'var(--danger)' : selected.risk === 'Moderate' ? 'var(--warning)' : 'var(--success)' }}>
                    {selected.mortality}
                  </div>
                </div>
                <div className={styles.detailStat}>
                  <div className={styles.detailStatLabel}>Incubation</div>
                  <div className={styles.detailStatValue}>{selected.incubation}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div style={{
    marginBottom: '0.85rem',
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    background: highlight ? '#F0FDFA' : 'var(--bg-primary)',
    borderLeft: highlight ? '3px solid var(--brand-primary)' : '3px solid var(--border-color)',
  }}>
    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-primary)', marginBottom: '0.2rem' }}>{label}</div>
    <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{value}</div>
  </div>
);
