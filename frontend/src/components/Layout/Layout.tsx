import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  HelpCircle, Settings, LogOut, Globe, X,
  Fish, Map, BookOpen, LayoutDashboard, Activity, ChevronDown,
  Wifi, WifiOff, CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { useLang, LANGUAGES, type LangCode } from '../../context/LangContext';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import styles from './Layout.module.css';

const HELP_ITEMS = [
  { title: 'Upload a fish photo', desc: 'Go to Diagnostics → select or drag an image → click Run Analysis.' },
  { title: 'Voice Symptom Check',  desc: 'In Diagnostics, click the Voice tab → describe symptoms aloud → get instant result.' },
  { title: 'Translate results',    desc: 'Use the language selector (top bar) to switch the full app language.' },
  { title: 'Send Telegram alert',  desc: 'After diagnosis, click Alert & Export → enter your Chat ID → Send Telegram.' },
  { title: 'View pond risk',       desc: 'Navigate to Ponds — see live risk scores from the backend.' },
  { title: 'Find a vet',           desc: 'Go to Vet Map → locate the nearest aquaculture clinic in Nagpur.' },
];

export const Layout: React.FC = () => {
  const { user, logout }   = useAuth();
  const { lang, setLang, t } = useLang();
  const navigate             = useNavigate();

  const [langOpen,     setLangOpen]     = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [helpOpen,     setHelpOpen]     = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isOnline,     setIsOnline]     = useState(navigator.onLine);
  const [syncToast,    setSyncToast]    = useState<string | null>(null);

  // Auto-sync offline queue when connection returns
  const handleSynced = useCallback((count: number) => {
    setSyncToast(`${count} offline scan${count > 1 ? 's' : ''} synced successfully!`);
    setTimeout(() => setSyncToast(null), 4000);
  }, []);
  useOfflineSync(handleSynced);

  const langRef    = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Offline detection
  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current    && !langRef.current.contains(e.target as Node))    setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const currentLang  = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const NAV_LINKS = [
    { to: '/',         label: t('Dashboard'),       icon: <LayoutDashboard size={15}/> },
    { to: '/diagnose', label: t('Diagnostics'),      icon: <Fish size={15}/> },
    { to: '/ponds',    label: t('Ponds'),            icon: <Activity size={15}/> },
    { to: '/library',  label: t('Disease Library'),  icon: <BookOpen size={15}/> },
    { to: '/map',      label: t('Vet Map'),          icon: <Map size={15}/> },
  ];

  return (
    <div className={styles.layout}>

      {/* ── Offline Banner ──────────────────────────────────────────── */}
      {!isOnline && (
        <div className={styles.offlineBanner}>
          <WifiOff size={14}/>
          {t('Offline Mode')} — {t('Limited Features')} · AI analysis unavailable · Scans will auto-sync when connected
        </div>
      )}

      {/* ── Sync Toast ───────────────────────────────────────────────── */}
      {syncToast && (
        <div className={styles.syncToast}>
          <CheckCircle2 size={14}/> {syncToast}
        </div>
      )}

      {/* ── Help Modal ─────────────────────────────────────────────── */}
      {helpOpen && (
        <div className={styles.overlay} onClick={() => setHelpOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('Help Center')}</h2>
              <button onClick={() => setHelpOpen(false)}><X size={18}/></button>
            </div>
            <div className={styles.modalBody}>
              {HELP_ITEMS.map((h, i) => (
                <div key={i} className={styles.helpItem}>
                  <div className={styles.helpNum}>{i + 1}</div>
                  <div>
                    <div className={styles.helpTitle}>{h.title}</div>
                    <div className={styles.helpDesc}>{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Panel ─────────────────────────────────────────── */}
      {settingsOpen && (
        <div className={styles.overlay} onClick={() => setSettingsOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('Settings')}</h2>
              <button onClick={() => setSettingsOpen(false)}><X size={18}/></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>{t('Switch Language')}</div>
                  <div className={styles.settingDesc}>Translates the full app interface</div>
                </div>
                <select value={lang} onChange={e => setLang(e.target.value as LangCode)} className={styles.settingSelect}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label} — {l.native}</option>)}
                </select>
              </div>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>Backend API</div>
                  <div className={styles.settingDesc}>Flask inference server</div>
                </div>
                <span className={styles.settingBadge}>localhost:5001</span>
              </div>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>AI Model</div>
                  <div className={styles.settingDesc}>MobileNetV2 — 7 disease classes</div>
                </div>
                <span className={styles.settingBadge}>v2 active</span>
              </div>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>Connection</div>
                  <div className={styles.settingDesc}>{isOnline ? 'All services available' : 'Offline — limited features'}</div>
                </div>
                <span className={clsx(styles.settingBadge, isOnline ? styles.badgeOnline : styles.badgeOffline)}>
                  {isOnline ? <><Wifi size={11}/> Online</> : <><WifiOff size={11}/> Offline</>}
                </span>
              </div>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>Account Role</div>
                  <div className={styles.settingDesc}>{user?.role}</div>
                </div>
                <span className={styles.settingBadge}>{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <NavLink to="/" className={styles.logo}>
          <img src="/logo.png" alt="AquaGuard AI" className={styles.logoImg}/>
        </NavLink>

        <nav className={styles.nav}>
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => clsx(styles.navLink, isActive && styles.active)}
            >
              {link.icon}{link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          {/* Online/Offline dot */}
          <div className={clsx(styles.connDot, isOnline ? styles.connOnline : styles.connOffline)} title={isOnline ? 'Connected' : 'Offline'}>
            {isOnline ? <Wifi size={12}/> : <WifiOff size={12}/>}
          </div>

          {/* Language Switcher */}
          <div className={styles.dropdownWrap} ref={langRef}>
            <button className={styles.iconBtn} onClick={() => { setLangOpen(v => !v); setProfileOpen(false); }} title={t('Switch Language')}>
              <Globe size={16}/>
              <span className={styles.langCode}>{currentLang.code.toUpperCase()}</span>
              <ChevronDown size={11}/>
            </button>
            {langOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownTitle}>{t('Switch Language')}</div>
                {LANGUAGES.map(l => (
                  <button key={l.code} className={clsx(styles.dropdownItem, lang === l.code && styles.dropdownItemActive)} onClick={() => { setLang(l.code); setLangOpen(false); }}>
                    <span>{l.label}</span>
                    <span className={styles.nativeLang}>{l.native}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className={styles.iconBtn} onClick={() => setHelpOpen(true)} title={t('Help Center')}><HelpCircle size={16}/></button>
          <button className={styles.iconBtn} onClick={() => setSettingsOpen(true)} title={t('Settings')}><Settings size={16}/></button>

          {/* Profile */}
          <div className={styles.dropdownWrap} ref={profileRef}>
            <button className={styles.profileBtn} onClick={() => { setProfileOpen(v => !v); setLangOpen(false); }}>
              {user?.photoURL
                ? <img src={user.photoURL} alt="avatar" className={styles.avatarImg}/>
                : <div className={styles.avatar}>{(user?.name?.[0] || 'U').toUpperCase()}</div>
              }
              <div className={styles.profileText}>
                <span className={styles.profileName}>{user?.name}</span>
                <span className={styles.profileRole}>{user?.role}</span>
              </div>
              <ChevronDown size={12}/>
            </button>
            {profileOpen && (
              <div className={clsx(styles.dropdown, styles.profileDropdown)}>
                <div className={styles.profileDropdownHeader}>
                  <div className={styles.profileDropdownName}>{user?.name}</div>
                  <div className={styles.profileDropdownEmail}>{user?.email || 'Dev Mode'}</div>
                </div>
                <button className={styles.dropdownItem} onClick={() => { setProfileOpen(false); navigate('/diagnose'); }}>
                  <Fish size={14}/> {t('New Diagnosis')}
                </button>
                <button className={styles.dropdownItem} onClick={() => { setProfileOpen(false); setSettingsOpen(true); }}>
                  <Settings size={14}/> {t('Settings')}
                </button>
                <div className={styles.dropdownDivider}/>
                <button className={clsx(styles.dropdownItem, styles.logoutItem)} onClick={handleLogout}>
                  <LogOut size={14}/> {t('Sign Out')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}><Outlet/></main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-2">
            <span className={styles.dot} style={{ background: 'var(--success)' }}/>
            AI Engine · MobileNetV2
          </span>
          <span className="flex items-center gap-2">
            <span className={styles.dot} style={{ background: isOnline ? 'var(--brand-primary)' : 'var(--danger)' }}/>
            {isOnline ? `API · localhost:5001` : t('Offline Mode')}
          </span>
          <span className="flex items-center gap-2">
            <Globe size={11}/> {currentLang.label}
          </span>
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>AquaGuard AI © 2026 · Nagpur</div>
      </footer>
    </div>
  );
};
