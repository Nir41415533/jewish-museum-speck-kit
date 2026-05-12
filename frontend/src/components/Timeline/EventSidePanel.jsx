import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { eventsApi } from '../../services/api';
import MediaViewer from '../Soldier/MediaViewer';
import './EventSidePanel.css';

function fmtDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

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

  const title       = event ? (language === 'he' ? event.title_he       : event.title_en)       : null;
  const description = event ? (language === 'he' ? event.description_he : event.description_en) : null;
  const country     = event?.country
    ? (language === 'he' ? event.country.name_he : event.country.name_en)
    : null;
  const startDate   = event ? fmtDate(event.start_date) : null;
  const endDate     = event?.end_date ? fmtDate(event.end_date) : null;

  return (
    <aside className="esp-panel">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="esp-header">
        <div className="esp-header-left">
          <span className="esp-ref">EVT-{String(eventId).padStart(4, '0')}</span>
          <span className="esp-badge">FIELD RECORD</span>
        </div>
        <button className="esp-close" onClick={onClose} aria-label={language === 'he' ? 'סגור' : 'Close'}>
          ✕
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="esp-body">

        {loading && <p className="esp-status">{language === 'he' ? 'טוען…' : 'Loading…'}</p>}
        {error   && <p className="esp-status esp-error">{language === 'he' ? 'שגיאה בטעינת הנתונים' : 'Failed to load'}</p>}

        {event && (
          <div className="esp-content">

            {/* Date stamp */}
            <div className="esp-date-band">
              <span className="esp-date-field-label">
                {language === 'he' ? 'תאריך' : 'DATE OF RECORD'}
              </span>
              <span className="esp-date-value">
                {startDate}{endDate && <> &ndash; {endDate}</>}
              </span>
            </div>

            {/* Title + country */}
            <div className="esp-title-section">
              <h2 className="esp-title">{title}</h2>
              {country && (
                <p className="esp-location">
                  <span className="esp-pin">📍</span>{country}
                </p>
              )}
            </div>

            {/* Perforated rule */}
            <div className="esp-perf-rule" />

            {/* Description */}
            {description && (
              <div className="esp-section">
                <span className="esp-section-label">
                  {language === 'he' ? 'תיאור' : 'ACCOUNT'}
                </span>
                <p className="esp-description">{description}</p>
              </div>
            )}

            {/* Media */}
            {event.media?.length > 0 && (
              <div className="esp-section">
                <span className="esp-section-label">
                  {language === 'he' ? 'תמונות' : 'DOCUMENTATION'}
                </span>
                <div className="esp-media">
                  <MediaViewer media={event.media} />
                </div>
              </div>
            )}

            {/* AI placeholder */}
            <div className="esp-section">
              <button className="esp-ai-btn" disabled>
                {language === 'he' ? '✦ הסבר בינה מלאכותית' : '✦ Get AI Context'}
              </button>
            </div>

          </div>
        )}
      </div>
    </aside>
  );
}
