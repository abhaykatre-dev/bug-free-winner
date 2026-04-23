import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileImage, ShieldCheck, Activity, Eye, Mic, MicOff, Search, AlertTriangle, CheckCircle2, Volume2, WifiOff } from 'lucide-react';
import clsx from 'clsx';
import styles from './Diagnostics.module.css';
import { useLang, LANGUAGES } from '../../context/LangContext';
import { matchSymptomsToDisease } from '../../data/diseaseData';
import { saveToQueue, cacheResult } from '../../hooks/useOfflineSync';

const SAMPLE_IMAGES = [
  { label: 'Bacterial Red Disease', img: '/sample_bacterial_red.jpg', badge: 'critical' },
  { label: 'Fungal Saprolegniasis', img: '/sample_fungal.jpg',        badge: 'warning' },
  { label: 'Healthy Fish',          img: '/sample_healthy.jpg',       badge: 'safe' },
  { label: 'Aeromoniasis',          img: '/sample_aeromoniasis.jpg',  badge: 'critical' },
  { label: 'Viral White Tail',       img: '/sample_viral.jpg',        badge: 'critical' },
];

export const Diagnostics: React.FC = () => {
  const [activeTab, setActiveTab]       = useState<'upload' | 'voice'>('upload');
  const [isDragging, setIsDragging]     = useState(false);
  const [preview, setPreview]           = useState<string | null>(null);
  const [isUploading, setIsUploading]   = useState(false);
  // Voice tab
  const [isRecording, setIsRecording]   = useState(false);
  const [transcript,  setTranscript]    = useState('');
  const [voiceResult, setVoiceResult]   = useState<ReturnType<typeof matchSymptomsToDisease> | null>(null);
  const [voiceError,  setVoiceError]    = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const { lang, setLang, t } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5001/api';

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

  /* ── Voice Symptom Detection ─────────────────────────────────────────── */
  const startRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setVoiceError('Voice recognition not supported. Please use Chrome.'); return; }
    setVoiceError(null); setTranscript(''); setVoiceResult(null);
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : lang === 'ta' ? 'ta-IN' : 'en-IN';
    rec.continuous = false; rec.interimResults = true;
    rec.onstart  = () => setIsRecording(true);
    rec.onend    = () => setIsRecording(false);
    rec.onresult = (e: any) => {
      const heard = Array.from(e.results).map((r: any) => r[0].transcript).join(' ');
      setTranscript(heard);
      if (e.results[e.results.length - 1].isFinal) {
        const match = matchSymptomsToDisease(heard);
        setVoiceResult(match);
      }
    };
    rec.onerror = (e: any) => { setVoiceError(`Error: ${e.error}`); setIsRecording(false); };
    rec.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    if (transcript) {
      const match = matchSymptomsToDisease(transcript);
      setVoiceResult(match);
    }
  };

  const analyzeVoiceResult = () => {
    if (!voiceResult) return;
    // Navigate to result with synthetic data so the result page renders
    const synth = {
      diagnosis_id:    `voice_${Date.now()}`,
      primary_disease:  voiceResult.disease,
      confidence:       voiceResult.confidence,
      severity:         voiceResult.severity,
      reasoning:        `Based on your described symptoms: "${transcript}". Keywords matched: ${voiceResult.keywords.join(', ')}.`,
      top_predictions:  [{ disease: voiceResult.disease, confidence: voiceResult.confidence }],
      causes:           { biological: ['Voice-based symptom analysis — confirm with image scan'], environmental: [] },
      treatment:        {},
      action_timeline:  [],
      similar_cases:    [],
    };
    navigate(`/result/${synth.diagnosis_id}`, { state: { resultData: synth, originalImage: null } });
  };

  /* ── AI Inference Call ───────────────────────────────────────────────── */
  const handleAnalyze = async () => {
    if (!preview) return;
    const base64Data = preview.split(',')[1];

    // ── Offline: queue for later sync ─────────────────────────────────
    if (!navigator.onLine) {
      const queued = saveToQueue({ imageBase64: base64Data, language: lang });
      const offlineResult = {
        diagnosis_id:   queued.id,
        primary_disease: 'Preliminary Analysis',
        confidence:      0,
        severity:        'Warning',
        reasoning:       'You are currently offline. This is a preliminary record. Full AI analysis will run automatically when you reconnect.',
        top_predictions: [{ disease: 'Pending — connect to sync', confidence: 0 }],
        causes:          { biological: ['Offline mode — full analysis pending'], environmental: [] },
        treatment:       {},
        action_timeline: [],
        similar_cases:   [],
        offline:         true,
      };
      cacheResult(queued.id, offlineResult, preview);
      navigate(`/result/${queued.id}`, { state: { resultData: offlineResult, originalImage: preview } });
      return;
    }

    // ── Online: run full inference ─────────────────────────────────
    setIsUploading(true);
    try {
      const response = await fetch(`${API_URL}/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data, language: lang }),
      });
      if (!response.ok) throw new Error('Diagnosis failed');
      const data = await response.json();
      cacheResult(data.diagnosis_id, data, preview);   // cache for offline viewing
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
            Upload or pick a sample fish image below. AquaDetect AI will detect diseases, generate a Grad-CAM heatmap, and recommend treatment in seconds.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={lang}
            onChange={e => setLang(e.target.value as any)}
            className={styles.langSelect}
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.label} — {l.native}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className={styles.tabRow}>
        <button className={clsx(styles.tab, activeTab === 'upload' && styles.tabActive)} onClick={() => setActiveTab('upload')}>
          <FileImage size={15}/> {t('Upload Image')}
        </button>
        <button className={clsx(styles.tab, activeTab === 'voice' && styles.tabActive)} onClick={() => setActiveTab('voice')}>
          <Mic size={15}/> {t('Voice Symptom Check')}
        </button>
      </div>

      {/* ── Upload Tab ────────────────────────────────────────────── */}
      {activeTab === 'upload' && (<>
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
                  AquaDetect AI is processing your image… generating Grad-CAM heatmap
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
              AquaDetect AI Online
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
      </> )} {/* end upload tab */}

      {/* ── Voice Symptom Tab ─────────────────────────────────────────── */}
      {activeTab === 'voice' && (
        <div className={clsx('card', styles.voicePanel)}>
          <div className={styles.voiceHeader}>
            <div>
              <h2 className={styles.voiceTitle}>{t('Voice Symptom Check')}</h2>
              <p className={styles.voiceSub}>
                Describe what you see — e.g. "fish has white spots on fins and is not eating" — and our AI will match it to a disease.
              </p>
            </div>
          </div>

          {/* Big mic button */}
          <div className={styles.voiceMicWrap}>
            <button
              className={clsx(styles.micBtn, isRecording && styles.micBtnActive)}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <MicOff size={32}/> : <Mic size={32}/>}
            </button>
            <div className={styles.micLabel}>
              {isRecording
                ? <><span className={styles.recDot}/> {t('Stop Recording')}</>
                : t('Start Recording')}
            </div>
          </div>

          {/* Transcript box */}
          {(transcript || isRecording) && (
            <div className={styles.transcriptBox}>
              <div className={styles.transcriptLabel}>{t('Describe Symptoms')}:</div>
              <div className={styles.transcriptText}>
                {transcript || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Listening…</span>}
              </div>
            </div>
          )}

          {voiceError && (
            <div className={styles.voiceError}><AlertTriangle size={14}/> {voiceError}</div>
          )}

          {/* Voice Result Card */}
          {voiceResult && !isRecording && (
            <div className={clsx(styles.voiceResult, voiceResult.severity === 'Critical' ? styles.voiceResultCritical : voiceResult.severity === 'Safe' ? styles.voiceResultSafe : styles.voiceResultWarn)}>
              <div className="flex justify-between items-start" style={{ marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    AI Symptom Match
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{voiceResult.disease}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Matched keywords: {voiceResult.keywords.join(', ') || 'general symptoms'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{Math.round(voiceResult.confidence * 100)}%</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)' }}>CONFIDENCE</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className={clsx('badge', voiceResult.severity === 'Critical' ? 'critical' : voiceResult.severity === 'Safe' ? 'safe' : 'warning')}>
                  {voiceResult.severity}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Confirm with image scan for full report</span>
              </div>
              <div className="flex gap-2 flex-wrap" style={{ marginTop: '1rem' }}>
                <button className="btn btn-primary" onClick={analyzeVoiceResult}>
                  <Search size={14}/> View Full Report
                </button>
                <button className="btn btn-outline" onClick={() => { setVoiceResult(null); setTranscript(''); }}>
                  Try Again
                </button>
                <button className="btn btn-outline" onClick={() => setActiveTab('upload')}>
                  <FileImage size={14}/> Upload Image Instead
                </button>
              </div>
            </div>
          )}

          {/* Hint keywords */}
          {!voiceResult && !isRecording && (
            <div className={styles.voiceHints}>
              <div className={styles.voiceHintsTitle}>Try saying:</div>
              <div className={styles.voiceHintTags}>
                {[
                  'fish has white spots on body',
                  'red patches on fins and skin',
                  'fish is not eating and swimming slow',
                  'white cotton like fungus on fish',
                  'fish has swollen belly',
                  'white tail disease',
                ].map((hint, i) => (
                  <span key={i} className={styles.hintTag} onClick={() => { setTranscript(hint); setVoiceResult(matchSymptomsToDisease(hint)); }}>
                    "{hint}"
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

