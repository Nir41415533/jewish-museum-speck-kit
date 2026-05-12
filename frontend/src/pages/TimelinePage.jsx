import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useMap } from '../context/MapContext';
import { useTimeline } from '../hooks/useTimeline';
import './TimelinePage.css';

function fmtDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function yearOf(dateStr) {
  return dateStr ? dateStr.slice(0, 4) : '????';
}

export default function TimelinePage() {
  const { language } = useLanguage();
  const { mapRef, setSelectedCountryId, setIsPanelOpen } = useMap();
  const navigate = useNavigate();
  const { events, loading, error } = useTimeline();

  // Group events by start year for section headers
  const grouped = useMemo(() => {
    const map = new Map();
    events.forEach(e => {
      const yr = yearOf(e.start_date);
      if (!map.has(yr)) map.set(yr, []);
      map.get(yr).push(e);
    });
    return Array.from(map.entries()); // [[year, events[]], ...]
  }, [events]);

  function handleEventClick(event) {
    if (mapRef.current && event.country) {
      mapRef.current.flyTo({ center: [event.country.lng, event.country.lat], zoom: 4 });
    }
    if (event.country) {
      setSelectedCountryId(event.country.id);
      setIsPanelOpen(true);
    }
    navigate(`/event/${event.id}`);
  }

  const t = {
    heading:  language === 'he' ? 'ציר הזמן ההיסטורי' : 'Historical Timeline',
    subhead:  language === 'he' ? 'רישום כרונולוגי' : 'Chronological Field Record',
    loading:  language === 'he' ? 'טוען…' : 'Loading…',
    error:    language === 'he' ? 'שגיאה בטעינת הנתונים' : 'Failed to load timeline',
    noData:   language === 'he' ? 'אין אירועים מתועדים' : 'No events recorded',
  };

  return (
    <div className="timeline-page">
      {/* Page header */}
      <div className="timeline-header">
        <div className="timeline-header-inner">
          <span className="timeline-ref">CHRONO-LOG · REF-TL001</span>
          <h1 className="timeline-heading">{t.heading}</h1>
          <p className="timeline-subhead">{t.subhead}</p>
        </div>
      </div>

      {/* Body */}
      <div className="timeline-body">
        {loading && <p className="timeline-status">{t.loading}</p>}
        {error   && <p className="timeline-status timeline-error">{t.error}</p>}
        {!loading && !error && events.length === 0 && (
          <p className="timeline-status">{t.noData}</p>
        )}

        {!loading && !error && grouped.map(([year, yearEvents]) => (
          <div key={year} className="timeline-year-group">
            {/* Year marker */}
            <div className="timeline-year-marker">
              <span className="timeline-year-label">{year}</span>
              <div className="timeline-year-line" />
            </div>

            {/* Events for this year */}
            <div className="timeline-entries">
              {yearEvents.map((event, i) => {
                const title    = language === 'he' ? event.title_he    : event.title_en;
                const country  = event.country
                  ? (language === 'he' ? event.country.name_he : event.country.name_en)
                  : null;
                const start    = fmtDate(event.start_date);
                const end      = event.end_date ? fmtDate(event.end_date) : null;

                return (
                  <div
                    key={event.id}
                    className="timeline-entry"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    {/* Connector dot */}
                    <div className="timeline-dot" />

                    {/* Card */}
                    <button
                      className="timeline-card"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="tc-date">
                        {start}{end && <> &ndash; {end}</>}
                      </div>
                      <div className="tc-title-row">
                        <span className="tc-title">{title}</span>
                        <span className="tc-arrow">›</span>
                      </div>
                      {country && (
                        <div className="tc-country">📍 {country}</div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
