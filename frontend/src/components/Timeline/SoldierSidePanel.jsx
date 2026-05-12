import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { soldiersApi } from '../../services/api';
import SoldierDetail from '../CountryPanel/SoldierDetail';
import './SoldierSidePanel.css';

export default function SoldierSidePanel({ soldierId, onClose }) {
  const { language } = useLanguage();
  const [soldier, setSoldier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setSoldier(null);
    soldiersApi.getById(soldierId)
      .then(res => setSoldier(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [soldierId]);

  return (
    <aside className="ssp-panel">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="ssp-header">
        <div className="ssp-header-left">
          <span className="ssp-ref">
            {soldier ? soldier.reference_code : `SOL-${String(soldierId).padStart(4, '0')}`}
          </span>
          <span className="ssp-badge">PERSONNEL FILE</span>
        </div>
        <button className="ssp-close" onClick={onClose} aria-label={language === 'he' ? 'סגור' : 'Close'}>
          ✕
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="ssp-body">
        {loading && <p className="ssp-status">{language === 'he' ? 'טוען…' : 'Loading…'}</p>}
        {error   && <p className="ssp-status ssp-error">{language === 'he' ? 'שגיאה בטעינת הנתונים' : 'Failed to load'}</p>}

        {soldier && (
          <div className="ssp-content">
            <SoldierDetail soldier={soldier} language={language} />
          </div>
        )}
      </div>
    </aside>
  );
}
