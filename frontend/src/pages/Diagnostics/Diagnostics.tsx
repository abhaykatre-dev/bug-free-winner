import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileImage, ShieldCheck, Activity, Eye } from 'lucide-react';
import clsx from 'clsx';
import styles from './Diagnostics.module.css';

export const Diagnostics: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP)');
      return;
    }
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    setIsUploading(true);
    
    try {
      const base64Data = preview.split(',')[1];
      
      const response = await fetch('http://localhost:5001/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data, language: 'en' })
      });
      
      if (!response.ok) throw new Error('Diagnosis failed');
      
      const data = await response.json();
      navigate(`/result/${data.diagnosis_id}`, { state: { resultData: data, originalImage: preview } });
      
    } catch (error) {
      console.error(error);
      alert('Failed to analyze image. Ensure backend is running.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Scan & Detect</h1>
          <p className={styles.subtitle}>Real-time aquatic sample analysis powered by AquaGuard AI</p>
        </div>
        <button className="btn btn-primary">
          <Activity size={18} /> Live Feed
        </button>
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
              <h3 className={styles.uploadTitle}>Analyze New Sample Imagery</h3>
              <p className={styles.uploadText}>
                Drag and drop high-resolution microscopic aquatic samples here, or click to browse files.
              </p>
              
              <div className={styles.uploadActions}>
                <button className="btn btn-primary">Select Files</button>
                <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); }}>Cloud Import</button>
              </div>
              
              <div className={styles.uploadTags}>
                <span className={styles.tag}><ShieldCheck size={14} /> JPEG/PNG/WebP</span>
                <span className={styles.tag}><ShieldCheck size={14} /> Max 10MB</span>
                <span className={styles.tag}><ShieldCheck size={14} /> AI-Annotated</span>
              </div>
            </div>
          ) : (
            <div className={styles.previewContainer}>
              <img src={preview} alt="Preview" className={styles.previewImage} />
              <div className={styles.previewActions}>
                <button className="btn btn-outline" onClick={() => { setFile(null); setPreview(null); }}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleAnalyze} 
                  disabled={isUploading}
                >
                  {isUploading ? 'Analyzing...' : 'Run Analysis'}
                </button>
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/jpeg, image/png, image/webp" 
            style={{ display: 'none' }} 
          />
        </div>

        {/* Lab Efficiency Stats */}
        <div className={clsx(styles.statsCard, 'card')}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>LAB EFFICIENCY</h3>
            <Activity size={16} color="var(--text-secondary)" />
          </div>
          
          <div className={styles.statRow}>
            <div className="flex justify-between" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>Processing Power</span>
              <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>94%</span>
            </div>
            <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '94%' }}></div></div>
          </div>
          
          <div className={styles.statRow}>
            <div className="flex justify-between" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>AI Confidence Avg.</span>
              <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>88.2%</span>
            </div>
            <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '88.2%' }}></div></div>
          </div>
          
          <div className={styles.statRow}>
            <div className="flex justify-between" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>Queue Status</span>
              <span style={{ color: 'var(--text-secondary)' }}>Optimal</span>
            </div>
            <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '15%', backgroundColor: 'var(--text-secondary)' }}></div></div>
          </div>

          <div className={styles.systemStatusBadge}>
            <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--brand-primary)', marginBottom: '0.25rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#67E8F9' }}></div>
              AquaGuard v2.4
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Connected to ML Runtime. Latency: 14ms</div>
          </div>
        </div>
      </div>

      <div className={clsx(styles.recentCard, 'card')}>
        <div className={styles.recentHeader}>
          <h3>Recent Diagnostics</h3>
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
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="flex items-center gap-3">
                  <div className={styles.tableThumb}><FileImage size={20} color="white" /></div>
                  AQ-9982-X
                </div>
              </td>
              <td style={{ color: 'var(--text-primary)' }}>Bacterial Red Disease</td>
              <td><span className="badge critical">CRITICAL</span></td>
              <td style={{ color: 'var(--brand-primary)' }}>98.4%</td>
              <td>2 mins ago</td>
              <td><button className={styles.iconBtn}><Eye size={18} /></button></td>
            </tr>
            <tr>
              <td>
                <div className="flex items-center gap-3">
                  <div className={styles.tableThumb}><FileImage size={20} color="white" /></div>
                  AQ-9975-B
                </div>
              </td>
              <td style={{ color: 'var(--text-primary)' }}>Healthy Fish</td>
              <td><span className="badge safe">CLEAR</span></td>
              <td style={{ color: 'var(--brand-primary)' }}>99.1%</td>
              <td>14 mins ago</td>
              <td><button className={styles.iconBtn}><Eye size={18} /></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
