import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth, googleProvider,
  signInWithPopup, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  updateProfile, type FirebaseUser,
} from '../lib/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string, role: string) => Promise<void>;
  loginDev: (name: string, role: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function firebaseUserToUser(fbUser: FirebaseUser, role = 'Aqua Farmer'): User {
  return {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
    email: fbUser.email || '',
    role: localStorage.getItem('aquadetect_role') || role,
    photoURL: fbUser.photoURL,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser(firebaseUserToUser(fbUser));
      } else {
        // Fall back to dev session
        const stored = localStorage.getItem('aquadetect_user');
        setUser(stored ? JSON.parse(stored) : null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    setUser(firebaseUserToUser(result.user));
  };

  const loginWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    setUser(firebaseUserToUser(result.user));
  };

  const registerWithEmail = async (name: string, email: string, password: string, role: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    localStorage.setItem('aquadetect_role', role);
    setUser(firebaseUserToUser(result.user, role));
  };

  const loginDev = (name: string, role: string) => {
    const u: User = { id: 'dev_' + Date.now(), name, email: '', role, photoURL: null };
    setUser(u);
    localStorage.setItem('aquadetect_user', JSON.stringify(u));
  };

  const logout = async () => {
    await signOut(auth).catch(() => {});
    localStorage.removeItem('aquadetect_user');
    localStorage.removeItem('aquadetect_role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, registerWithEmail, loginDev, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
