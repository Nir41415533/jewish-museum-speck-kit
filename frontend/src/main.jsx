import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { MapProvider } from './context/MapContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <MapProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/map" element={<MapPage />} />
              {/* Phase 8+: language toggle */}
            </Routes>
          </Layout>
        </BrowserRouter>
      </MapProvider>
    </LanguageProvider>
  </React.StrictMode>
);
