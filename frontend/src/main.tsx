import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Diagnostics } from './pages/Diagnostics/Diagnostics';
import { DiagnosisResult } from './pages/DiagnosisResult/DiagnosisResult';
import { PathogenLibrary } from './pages/PathogenLibrary/PathogenLibrary';
import { Login } from './pages/Login/Login';
import { MapPage } from './pages/MapPage/MapPage';
import { PondsPage } from './pages/PondsPage/PondsPage';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #CCFBF1', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }}/>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading AquaDetect…</div>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LangProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="diagnose" element={<Diagnostics />} />
              <Route path="result/:id" element={<DiagnosisResult />} />
              <Route path="ponds" element={<PondsPage />} />
              <Route path="library" element={<PathogenLibrary />} />
              <Route path="map" element={<MapPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LangProvider>
    </AuthProvider>
  </StrictMode>
);
