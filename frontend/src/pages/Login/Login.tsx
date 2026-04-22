import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';
import { ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [name, setName] = useState('Raju Patil');
  const [role, setRole] = useState('Aqua Farmer');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(name, role);
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <span style={{color: 'var(--brand-primary)'}}>AquaGuard</span>
          <span style={{ color: 'var(--text-primary)' }}>AI</span>
        </div>
        <p className={styles.subtitle}>Secure Access Portal</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className={styles.input}
            >
              <option>Aqua Farmer</option>
              <option>Extension Officer / Vet</option>
              <option>Researcher</option>
            </select>
          </div>

          <button type="submit" className={styles.loginBtn}>
            Authenticate <ShieldCheck size={18} />
          </button>
        </form>
        
        <div className={styles.footer}>
          Dev Mode Active. No password required.
        </div>
      </div>
    </div>
  );
};
