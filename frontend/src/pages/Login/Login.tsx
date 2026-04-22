import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Fish, Mail, Lock, User, Shield, Globe2, Eye, EyeOff } from 'lucide-react';
import styles from './Login.module.css';

type Mode = 'login' | 'register';

const ROLES = ['Aqua Farmer', 'Extension Officer / Vet', 'Researcher', 'NGO Worker'];

export const Login: React.FC = () => {
  const [mode, setMode]           = useState<Mode>('login');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState(ROLES[0]);
  const [showPwd, setShowPwd]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (e: any) {
      setError(e.message?.replace('Firebase: ', '') || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) throw new Error('Full name is required');
        await registerWithEmail(name.trim(), email, password, role);
      }
      navigate('/');
    } catch (e: any) {
      const msg = e.message?.replace('Firebase: ', '') || 'Authentication failed';
      // Friendly Firebase error messages
      setError(
        msg.includes('user-not-found') ? 'No account found with this email' :
        msg.includes('wrong-password')  ? 'Incorrect password' :
        msg.includes('email-already')   ? 'Email already registered — please log in' :
        msg.includes('weak-password')   ? 'Password must be at least 6 characters' :
        msg.includes('invalid-email')   ? 'Please enter a valid email address' :
        msg
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Background blobs */}
      <div className={styles.blob1}/>
      <div className={styles.blob2}/>

      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}><Fish size={28} color="white"/></div>
          <div>
            <h1 className={styles.brandName}>AquaGuard <span>AI</span></h1>
            <p className={styles.brandTagline}>AI-Powered Fish Disease Detection</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className={styles.tabs}>
          <button className={mode === 'login' ? styles.tabActive : styles.tab} onClick={() => { setMode('login'); setError(null); }}>
            Sign In
          </button>
          <button className={mode === 'register' ? styles.tabActive : styles.tab} onClick={() => { setMode('register'); setError(null); }}>
            Register
          </button>
        </div>

        {/* Google OAuth */}
        <button className={styles.googleBtn} onClick={handleGoogleLogin} disabled={isLoading}>
          <Globe2 size={18}/>
          Continue with Google
        </button>

        <div className={styles.divider}><span>or</span></div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <div className={styles.inputGroup}>
              <div className={styles.inputIcon}><User size={16}/></div>
              <input
                type="text" placeholder="Full Name" value={name}
                onChange={e => setName(e.target.value)}
                className={styles.input} required
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <div className={styles.inputIcon}><Mail size={16}/></div>
            <input
              type="email" placeholder="Email address" value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.input} required
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputIcon}><Lock size={16}/></div>
            <input
              type={showPwd ? 'text' : 'password'} placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)}
              className={styles.input} required minLength={6}
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(v => !v)}>
              {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>

          {mode === 'register' && (
            <div className={styles.inputGroup}>
              <div className={styles.inputIcon}><Shield size={16}/></div>
              <select value={role} onChange={e => setRole(e.target.value)} className={styles.input}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          )}

          {error && <div className={styles.errorBox}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? <span className={styles.spinner}/> : null}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className={styles.footNote}>
          {mode === 'login'
            ? <><span>New here? </span><button onClick={() => setMode('register')} className={styles.linkBtn}>Create an account</button></>
            : <><span>Already registered? </span><button onClick={() => setMode('login')} className={styles.linkBtn}>Sign in</button></>
          }
        </p>
      </div>
    </div>
  );
};
