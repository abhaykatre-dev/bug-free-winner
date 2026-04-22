import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { HelpCircle, Settings, ChevronDown, Activity, Map, Languages, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
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
            <div className={styles.avatar}>{user?.name.charAt(0)}</div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>
                {user?.name} 
              </span>
              <span className={styles.profileRole}>{user?.role}</span>
            </div>
            <button className={styles.iconBtn} onClick={handleLogout} style={{marginLeft: '0.5rem'}} title="Logout">
              <LogOut size={16} />
            </button>
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
