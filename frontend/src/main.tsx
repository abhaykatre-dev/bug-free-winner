import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Diagnostics } from './pages/Diagnostics/Diagnostics';
import { DiagnosisResult } from './pages/DiagnosisResult/DiagnosisResult';
import { PathogenLibrary } from './pages/PathogenLibrary/PathogenLibrary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="diagnose" element={<Diagnostics />} />
          <Route path="result/:id" element={<DiagnosisResult />} />
          <Route path="ponds" element={<div style={{padding: '2rem'}}>Pond Management (Coming Soon)</div>} />
          <Route path="library" element={<PathogenLibrary />} />
          <Route path="map" element={<div style={{padding: '2rem'}}>Vet Locator Map (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
