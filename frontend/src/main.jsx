import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { MapProvider } from './context/MapContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import SoldierPage from './pages/SoldierPage';
import EventPage from './pages/EventPage';
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
              <Route path="/soldier/:id" element={<SoldierPage />} />
              <Route path="/event/:id"    element={<EventPage />} />
              {/* Phase 7+: /search */}
            </Routes>
          </Layout>
        </BrowserRouter>
      </MapProvider>
    </LanguageProvider>
  </React.StrictMode>
);
