import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useMap } from '../../context/MapContext';
import { useTimeline } from '../../hooks/useTimeline';
import './TimelineSidebar.css';

export default function TimelineSidebar({ onEventClick }) {
  const { language } = useLanguage();
  const { mapRef } = useMap();
  const { events, loading, error } = useTimeline();
  const [openYear, setOpenYear] = useState(null);

  // Group by year — events arrive date_asc so year order is preserved
  const grouped = useMemo(() => {
    const map = new Map();
    events.forEach(e => {
      const yr = e.start_date ? e.start_date.slice(0, 4) : '????';
      if (!map.has(yr)) map.set(yr, []);
      map.get(yr).push(e);
    });
    return Array.from(map.entries());
  }, [events]);

  function toggleYear(year) {
    setOpenYear(prev => (prev === year ? null : year));
  }

  function handleEventClick(event) {
    if (mapRef.current && event.country) {
      mapRef.current.flyTo({
        center: [event.country.lng, event.country.lat],
        zoom: 5,
        duration: 1400,
      });
    }
    onEventClick?.(event);
  }

  return (
    <aside className="tl-sidebar">
      {/* Header */}
      <div className="tl-header">
        <span className="tl-ref">CHRONO-LOG</span>
        <h2 className="tl-heading">
          {language === 'he' ? 'ציר הזמן' : 'Timeline'}
        </h2>
      </div>

      {/* Scrollable body */}
      <div className="tl-body">
        {loading && <p className="tl-status">…</p>}
        {error   && <p className="tl-status tl-error">!</p>}

        {!loading && !error && grouped.map(([year, yearEvents]) => (
          <div key={year} className={`tl-year-block${openYear === year ? ' is-open' : ''}`}>

            {/* Year row */}
            <button
              className="tl-year-btn"
              onClick={() => toggleYear(year)}
              aria-expanded={openYear === year}
            >
              <span className="tl-chevron">{openYear === year ? '▾' : '▸'}</span>
              <span className="tl-year-num">{year}</span>
              <span className="tl-year-count">{yearEvents.length}</span>
            </button>

            {/* Events (only when open) */}
            {openYear === year && (
              <div className="tl-events">
                {yearEvents.map(e => (
                  <button
                    key={e.id}
                    className="tl-event-btn"
                    onClick={() => handleEventClick(e)}
                    title={e.country
                      ? (language === 'he' ? e.country.name_he : e.country.name_en)
                      : ''}
                  >
                    <span className="tl-event-dot" />
                    <span className="tl-event-title">
                      {language === 'he' ? e.title_he : e.title_en}
                    </span>
                    <span className="tl-event-arrow">›</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
