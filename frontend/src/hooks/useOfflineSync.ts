/**
 * useOfflineSync — Simple offline queue manager
 * - Queues scan requests when offline
 * - Auto-syncs when connection returns
 * - Caches diagnosis results for offline viewing
 */
import { useEffect, useRef } from 'react';

const QUEUE_KEY  = 'aquaguard_offline_queue';
const CACHE_KEY  = 'aquaguard_result_cache';
const API_URL    = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5001/api';

// ── Types ────────────────────────────────────────────────────────────────────
export interface QueuedScan {
  id: string;
  imageBase64: string;
  language: string;
  timestamp: number;
  pondId?: string;
}

export interface CachedResult {
  diagnosisId: string;
  result: any;
  originalImage: string | null;
  cachedAt: number;
}

// ── Read / Write helpers ──────────────────────────────────────────────────────
export const getQueue = (): QueuedScan[] => {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); }
  catch { return []; }
};

export const saveToQueue = (scan: Omit<QueuedScan, 'id' | 'timestamp'>): QueuedScan => {
  const item: QueuedScan = { ...scan, id: `offline_${Date.now()}`, timestamp: Date.now() };
  const q = getQueue();
  q.push(item);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  return item;
};

const removeFromQueue = (id: string) => {
  const q = getQueue().filter(s => s.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
};

export const cacheResult = (diagnosisId: string, result: any, originalImage: string | null) => {
  try {
    const cache: CachedResult[] = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    // Keep only last 20 results to avoid quota issues
    const updated = [{ diagnosisId, result, originalImage, cachedAt: Date.now() }, ...cache].slice(0, 20);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
  } catch { /* storage full — skip */ }
};

export const getCachedResult = (diagnosisId: string): CachedResult | null => {
  try {
    const cache: CachedResult[] = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    return cache.find(c => c.diagnosisId === diagnosisId) ?? null;
  } catch { return null; }
};

export const getAllCachedResults = (): CachedResult[] => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]'); }
  catch { return []; }
};

// ── Approved Plans ────────────────────────────────────────────────────────────
const APPROVED_KEY = 'aquaguard_approved_plans';

export interface ApprovedPlan {
  diagnosisId: string;
  disease: string;
  severity: string;
  confidence: number;
  approvedAt: number;
  completedSteps: number[];
}

export const saveApprovedPlan = (plan: Omit<ApprovedPlan, 'approvedAt'>): void => {
  try {
    const plans: ApprovedPlan[] = JSON.parse(localStorage.getItem(APPROVED_KEY) || '[]');
    const existing = plans.findIndex(p => p.diagnosisId === plan.diagnosisId);
    const item = { ...plan, approvedAt: Date.now() };
    if (existing >= 0) plans[existing] = item;
    else plans.unshift(item);
    localStorage.setItem(APPROVED_KEY, JSON.stringify(plans.slice(0, 30)));
  } catch { /* quota */ }
};

export const getApprovedPlans = (): ApprovedPlan[] => {
  try { return JSON.parse(localStorage.getItem(APPROVED_KEY) || '[]'); }
  catch { return []; }
};

export const updateApprovedPlanSteps = (diagnosisId: string, steps: number[]) => {
  const plans = getApprovedPlans();
  const idx = plans.findIndex(p => p.diagnosisId === diagnosisId);
  if (idx >= 0) { plans[idx].completedSteps = steps; localStorage.setItem(APPROVED_KEY, JSON.stringify(plans)); }
};

// ── Sync function ──────────────────────────────────────────────────────────────
export const syncQueue = async (): Promise<{ synced: number; failed: number }> => {
  const queue = getQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0, failed = 0;
  for (const item of queue) {
    try {
      const res = await fetch(`${API_URL}/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: item.imageBase64, language: item.language }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      // Cache the real result, overwriting the offline placeholder
      cacheResult(data.diagnosis_id, data, null);
      // Also update the approved plan if this was queued from approve flow
      removeFromQueue(item.id);
      synced++;
    } catch {
      failed++;
    }
  }
  return { synced, failed };
};

// ── Hook ───────────────────────────────────────────────────────────────────────
export const useOfflineSync = (onSynced?: (count: number) => void) => {
  const syncingRef = useRef(false);

  useEffect(() => {
    const handleOnline = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      const { synced } = await syncQueue();
      syncingRef.current = false;
      if (synced > 0) onSynced?.(synced);
    };

    window.addEventListener('online', handleOnline);
    // Also try to sync on mount if we're online and queue is non-empty
    if (navigator.onLine && getQueue().length > 0) handleOnline();

    return () => window.removeEventListener('online', handleOnline);
  }, [onSynced]);
};
