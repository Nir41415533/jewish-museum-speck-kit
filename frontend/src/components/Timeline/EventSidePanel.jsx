import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { eventsApi } from '../../services/api';
import EventDetail from '../CountryPanel/EventDetail';
import './EventSidePanel.css';

export default function EventSidePanel({ eventId, onClose }) {
  const { language } = useLanguage();
  const [event,   setEvent]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setEvent(null);
    eventsApi.getById(eventId)
      .then(res => setEvent(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [eventId]);

  return (
    <aside className="esp-panel">
      {/* Header */}
      <div className="esp-header">
        <span className="esp-badge">EVENT RECORD</span>
        <button
          className="esp-close"
          onClick={onClose}
          aria-label={language === 'he' ? 'סגור' : 'Close'}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="esp-body">
        {loading && (
          <p className="esp-status">
            {language === 'he' ? 'טוען…' : 'Loading…'}
          </p>
        )}
        {error && (
          <p className="esp-status esp-error">
            {language === 'he' ? 'שגיאה בטעינת הנתונים' : 'Failed to load'}
          </p>
        )}
        {event && <EventDetail event={event} language={language} />}
      </div>
    </aside>
  );
}
