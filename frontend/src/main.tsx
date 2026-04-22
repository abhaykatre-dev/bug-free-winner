import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Diagnostics } from './pages/Diagnostics/Diagnostics';
import { DiagnosisResult } from './pages/DiagnosisResult/DiagnosisResult';
import { PathogenLibrary } from './pages/PathogenLibrary/PathogenLibrary';
import { Login } from './pages/Login/Login';
import { MapPage } from './pages/MapPage/MapPage';
import { PondsPage } from './pages/PondsPage/PondsPage';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
