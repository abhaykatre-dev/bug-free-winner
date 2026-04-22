import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { HelpCircle, Settings, ChevronDown, Activity, Map, Languages } from 'lucide-react';
import clsx from 'clsx';
import styles from './Layout.module.css';

export const Layout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.logoContainer}>
          <span>AquaGuard</span><span style={{ color: 'var(--text-primary)' }}>AI</span>
        </NavLink>

        <nav className={styles.nav}>
          <NavLink to="/" className={({ isActive }) => clsx(styles.navLink, isActive && styles.active)}>
            Dashboard
          </NavLink>
          <NavLink to="/diagnose" className={({ isActive }) => clsx(styles.navLink, isActive && styles.active)}>
            Diagnostics
          </NavLink>
          <NavLink to="/ponds" className={({ isActive }) => clsx(styles.navLink, isActive && styles.active)}>
            Ponds
          </NavLink>
          <NavLink to="/library" className={({ isActive }) => clsx(styles.navLink, isActive && styles.active)}>
            Pathogen Library
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => clsx(styles.navLink, isActive && styles.active)}>
            Vet Map
          </NavLink>
        </nav>

        <div className={styles.actions}>
          <button className={styles.iconBtn} title="Change Language">
            <Languages size={20} />
          </button>
          <button className={styles.iconBtn} title="Help Center">
            <HelpCircle size={20} />
          </button>
          <button className={styles.iconBtn} title="Settings">
            <Settings size={20} />
          </button>
          
          <div className={styles.profile}>
            <div className={styles.avatar}>RJ</div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>
                Raju Patil <ChevronDown size={14} className={styles.iconBtn} />
              </span>
              <span className={styles.profileRole}>Aqua Farmer</span>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
            AI Engine v4.2 Active
          </span>
          <span className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--brand-primary)' }}></div>
            API Connected
          </span>
        </div>
        <div>Latency: 14ms</div>
      </footer>
    </div>
  );
};
