import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileImage, ShieldCheck, Activity, Eye, Mic } from 'lucide-react';
import clsx from 'clsx';
import styles from './Diagnostics.module.css';

// Sample images from the training dataset for quick demo
const SAMPLE_IMAGES = [
  { label: 'Bacterial Red Disease', img: '/sample_bacterial_red.jpg', badge: 'critical' },
  { label: 'Fungal Saprolegniasis', img: '/sample_fungal.jpg',        badge: 'warning' },
  { label: 'Healthy Fish',          img: '/sample_healthy.jpg',       badge: 'safe' },
  { label: 'Aeromoniasis',          img: '/sample_aeromoniasis.jpg',  badge: 'critical' },
  { label: 'Viral White Tail',       img: '/sample_viral.jpg',        badge: 'critical' },
];

export const Diagnostics: React.FC = () => {
  const [isDragging, setIsDragging]     = useState(false);
  const [preview, setPreview]           = useState<string | null>(null);
  const [isUploading, setIsUploading]   = useState(false);
  const [language, setLanguage]         = useState('en');
  const [isListening, setIsListening]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  /* ── Drag / Drop / Select ────────────────────────────────────────────── */
  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };
  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { alert('Please select an image file (JPEG, PNG, WebP)'); return; }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  /* ── Quick-pick sample image from dataset ────────────────────────────── */
  const handleSamplePick = async (imgSrc: string) => {
    const res  = await fetch(imgSrc);
    const blob = await res.blob();
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(blob);
  };

  /* ── Voice Input (Web Speech API) ────────────────────────────────────── */
  const handleVoiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice not supported in this browser. Use Chrome.'); return; }
    const rec = new SR();
    rec.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : language === 'ta' ? 'ta-IN' : 'en-IN';
    rec.onstart  = () => setIsListening(true);
    rec.onend    = () => setIsListening(false);
    rec.onresult = (e: any) => {
      const heard = e.results[0][0].transcript.toLowerCase();
      if (heard.includes('analyz') || heard.includes('scan') || heard.includes('detect')) {
        handleAnalyze();
      }
    };
    rec.start();
  };

  /* ── AI Inference Call ───────────────────────────────────────────────── */
  const handleAnalyze = async () => {
    if (!preview) return;
    setIsUploading(true);
    try {
      const base64Data = preview.split(',')[1];
      const response = await fetch('http://localhost:5001/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data, language }),
      });
      if (!response.ok) throw new Error('Diagnosis failed');
      const data = await response.json();
      navigate(`/result/${data.diagnosis_id}`, { state: { resultData: data, originalImage: preview } });
    } catch (err) {
      console.error(err);
      alert('Analysis failed. Is the backend running on port 5001?');
    } finally {
      setIsUploading(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Scan & Detect</h1>
          <p className={styles.subtitle}>
            Upload or pick a sample fish image below. AquaGuard AI will detect diseases, generate a Grad-CAM heatmap, and recommend treatment in seconds.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className={styles.langSelect}
          >
            <option value="en">🇬🇧 English</option>
            <option value="hi">🇮🇳 हिन्दी</option>
            <option value="mr">🇮🇳 मराठी</option>
            <option value="ta">🇮🇳 தமிழ்</option>
          </select>
          <button
            className={clsx('btn', isListening ? 'btn-primary' : 'btn-outline')}
            onClick={handleVoiceInput}
            title="Say 'Analyze' to start"
          >
            <Mic size={16} />
            {isListening ? 'Listening…' : 'Voice'}
          </button>
        </div>
      </header>

      <div className={styles.topSection}>
        {/* Upload Card */}
        <div className={clsx(styles.uploadCard, 'card')}>
          {!preview ? (
            <div
              className={clsx(styles.dropZone, isDragging && styles.dragging)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.uploadIcon}>
                <UploadCloud size={32} color="var(--brand-primary)" />
              </div>
              <h3 className={styles.uploadTitle}>Upload Fish Image</h3>
              <p className={styles.uploadText}>
                Drag and drop a fish photo here, or click to browse. Or use a sample image below ↓
              </p>
              <div className={styles.uploadActions}>
                <button className="btn btn-primary">Select Photo</button>
              </div>
              <div className={styles.uploadTags}>
                <span className={styles.tag}><ShieldCheck size={13} /> JPEG / PNG</span>
                <span className={styles.tag}><ShieldCheck size={13} /> Max 10 MB</span>
                <span className={styles.tag}><ShieldCheck size={13} /> AI-Powered</span>
              </div>
            </div>
          ) : (
            <div className={styles.previewContainer}>
              <img src={preview} alt="Preview" className={styles.previewImage} />
              <div className={styles.previewActions}>
                <button className="btn btn-outline" onClick={() => setPreview(null)}>
                  ← Change Image
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAnalyze}
                  disabled={isUploading}
                  style={{ minWidth: 160 }}
                >
                  {isUploading ? (
                    <><span className={styles.spinner} /> Analyzing…</>
                  ) : (
                    '🔬 Run Analysis'
                  )}
                </button>
              </div>
              {isUploading && (
                <div className={styles.analyzingBanner}>
                  <span className={styles.spinner} />
                  AquaGuard AI is processing your image… generating Grad-CAM heatmap
                </div>
              )}
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
          />
        </div>

        {/* Stats Sidebar */}
        <div className={clsx(styles.statsCard, 'card')}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              SYSTEM STATS
            </h3>
            <Activity size={16} color="var(--text-secondary)" />
          </div>

          {[
            { label: 'Model Accuracy', value: '90.2%', pct: 90 },
            { label: 'Avg. Inference Time', value: '1.2s', pct: 88 },
            { label: 'Diseases Covered', value: '7 Classes', pct: 70 },
          ].map(s => (
            <div key={s.label} className={styles.statRow}>
              <div className="flex justify-between" style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                <span>{s.label}</span>
                <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{s.value}</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}

          <div className={styles.systemStatusBadge}>
            <div className="flex items-center gap-2" style={{ fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#67E8F9', animation: 'blink 1.5s infinite' }} />
              AquaGuard AI Online
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              MobileNetV2 · Nagpur Dataset · Latency &lt;2s
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Sample Images */}
      <div className={clsx('card', styles.samplesSection)}>
        <div className={styles.samplesHeader}>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
              🧪 Quick-Test with Dataset Samples
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Pick any of these real images from the training dataset to instantly test the AI detection pipeline.
            </p>
          </div>
        </div>
        <div className={styles.sampleGrid}>
          {SAMPLE_IMAGES.map(s => (
            <button
              key={s.label}
              className={styles.sampleCard}
              onClick={() => handleSamplePick(s.img)}
            >
              <img src={s.img} alt={s.label} className={styles.sampleImg} />
              <div className={styles.sampleOverlay}>
                <span className={clsx('badge', s.badge)} style={{ marginBottom: '0.4rem' }}>
                  {s.badge === 'critical' ? 'HIGH RISK' : s.badge === 'warning' ? 'MODERATE' : 'HEALTHY'}
                </span>
                <div className={styles.sampleLabel}>{s.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Diagnostics */}
      <div className={clsx(styles.recentCard, 'card')}>
        <div className={styles.recentHeader}>
          <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>Recent Diagnostics</h3>
          <button style={{ color: 'var(--brand-primary)', fontWeight: 500, fontSize: '0.875rem' }}>View History →</button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>SAMPLE ID</th>
              <th>PRIMARY DISEASE</th>
              <th>STATUS</th>
              <th>CONFIDENCE</th>
              <th>TIMESTAMP</th>
              <th>VIEW</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'AQ-9982-X', disease: 'Bacterial Red Disease', badge: 'critical', conf: '98.4%', time: '2 mins ago' },
              { id: 'AQ-9975-B', disease: 'Healthy Fish',           badge: 'safe',     conf: '99.1%', time: '14 mins ago' },
              { id: 'AQ-9961-C', disease: 'Fungal Saprolegniasis',  badge: 'warning',  conf: '87.3%', time: '1 hr ago' },
            ].map(row => (
              <tr key={row.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className={styles.tableThumb}><FileImage size={18} color="white" /></div>
                    {row.id}
                  </div>
                </td>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{row.disease}</td>
                <td><span className={clsx('badge', row.badge)}>{row.badge === 'critical' ? 'CRITICAL' : row.badge === 'warning' ? 'WARNING' : 'CLEAR'}</span></td>
                <td style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{row.conf}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{row.time}</td>
                <td><button className={styles.iconBtn}><Eye size={18} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
