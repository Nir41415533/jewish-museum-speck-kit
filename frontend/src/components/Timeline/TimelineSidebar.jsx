import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useMap } from '../../context/MapContext';
import { useTimeline } from '../../hooks/useTimeline';
import './TimelineSidebar.css';

export default function TimelineSidebar({ onEventClick }) {
  const { language } = useLanguage();
  const { mapRef } = useMap();
  const { years, eventsByYear, loadingYears, loadingYear, error, loadYear } = useTimeline();
  const [openYear, setOpenYear] = useState(null);

  function toggleYear(year) {
    if (openYear === year) {
      setOpenYear(null);
      return;
    }
    setOpenYear(year);
    loadYear(year);
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
        {loadingYears && <p className="tl-status">…</p>}
        {error        && <p className="tl-status tl-error">!</p>}

        {!loadingYears && !error && years.map(({ year, count }) => {
          const isOpen  = openYear === year;
          const events  = eventsByYear[year] ?? [];
          const fetching = loadingYear === year;

          return (
            <div key={year} className={`tl-year-block${isOpen ? ' is-open' : ''}`}>
              <button
                className="tl-year-btn"
                onClick={() => toggleYear(year)}
                aria-expanded={isOpen}
              >
                <span className="tl-chevron">{isOpen ? '▾' : '▸'}</span>
                <span className="tl-year-num">{year}</span>
                <span className="tl-year-count">{count}</span>
              </button>

              {isOpen && (
                <div className="tl-events">
                  {fetching && <p className="tl-status">…</p>}
                  {!fetching && events.map(e => (
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
          );
        })}
      </div>
    </aside>
  );
}
