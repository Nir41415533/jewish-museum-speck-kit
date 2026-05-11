import React from 'react';
import MediaViewer from '../Soldier/MediaViewer';

function fmt(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export default function EventDetail({ event, language: lang }) {
  const title       = lang === 'he' ? event.title_he       : event.title_en;
  const description = lang === 'he' ? event.description_he : event.description_en;
  const countryName = event.country
    ? (lang === 'he' ? event.country.name_he : event.country.name_en)
    : null;

  const startLabel = fmt(event.start_date);
  const endLabel   = event.end_date ? fmt(event.end_date) : null;

  return (
    <div className="detail-inner">
      {/* hero */}
      <div className="detail-hero event-hero">
        <span className="detail-ref event-date-badge">
          {startLabel}{endLabel && <> &ndash; {endLabel}</>}
        </span>
        <h2 className="detail-name">{title}</h2>
        {countryName && <p className="detail-sub">📍 {countryName}</p>}
      </div>

      {/* description */}
      {description && (
        <div className="detail-section">
          <h3 className="detail-section-title">{lang === 'he' ? 'תיאור' : 'Description'}</h3>
          <p className="detail-bio">{description}</p>
        </div>
      )}

      {/* media */}
      {event.media.length > 0 && (
        <div className="detail-section">
          <h3 className="detail-section-title">{lang === 'he' ? 'תמונות' : 'Media'}</h3>
          <MediaViewer media={event.media} />
        </div>
      )}

      {/* AI placeholder */}
      <div className="detail-section">
        <button className="detail-ai-btn" disabled>
          {lang === 'he' ? '✦ הסבר בינה מלאכותית' : '✦ Get AI Context'}
        </button>
      </div>
    </div>
  );
}
