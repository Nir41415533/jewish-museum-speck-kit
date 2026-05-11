import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { eventsApi } from '../services/api';
import MediaViewer from '../components/Soldier/MediaViewer';
import './EventPage.css';

function formatDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export default function EventPage() {
  const { id } = useParams();
  const { language } = useLanguage();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    eventsApi.getById(id)
      .then(res => setEvent(res.data))
      .catch(err => setError(err.status === 404 ? 'not_found' : 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="event-page">
        <div className="event-status">
          {language === 'he' ? 'טוען אירוע…' : 'Loading event…'}
        </div>
      </div>
    );
  }

  if (error === 'not_found') {
    return (
      <div className="event-page">
        <div className="event-status">
          <p>{language === 'he' ? 'אירוע לא נמצא' : 'Event not found'}</p>
          <Link to="/map" className="back-link">
            {language === 'he' ? '← חזרה למפה' : '← Back to map'}
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-page">
        <div className="event-status">
          {language === 'he' ? 'שגיאה בטעינת הנתונים' : 'Failed to load event'}
        </div>
      </div>
    );
  }

  const title       = language === 'he' ? event.title_he       : event.title_en;
  const description = language === 'he' ? event.description_he : event.description_en;
  const countryName = event.country
    ? (language === 'he' ? event.country.name_he : event.country.name_en)
    : null;

  const startLabel = formatDate(event.start_date);
  const endLabel   = event.end_date ? formatDate(event.end_date) : null;

  return (
    <div className="event-page">
      <div className="event-dossier">

        <Link to="/map" className="back-link">
          {language === 'he' ? '← חזרה למפה' : '← Back to map'}
        </Link>

        {/* Header */}
        <header className="event-header">
          <div className="event-date-badge">
            {startLabel}
            {endLabel && <> &ndash; {endLabel}</>}
          </div>
          <h1 className="event-title">{title}</h1>
          {countryName && (
            <p className="event-country">📍 {countryName}</p>
          )}
        </header>

        <div className="event-body">

          {/* Description */}
          {description && (
            <section className="event-section">
              <h2 className="event-section-title">
                {language === 'he' ? 'תיאור' : 'Description'}
              </h2>
              <p className="event-description">{description}</p>
            </section>
          )}

          {/* Media */}
          {event.media.length > 0 && (
            <section className="event-section">
              <h2 className="event-section-title">
                {language === 'he' ? 'תמונות ווידאו' : 'Photos & Video'}
              </h2>
              <MediaViewer media={event.media} />
            </section>
          )}

          {/* AI Context placeholder — wired in T064 (Phase 9) */}
          <section className="event-section event-ai-section">
            <button className="ai-context-btn" disabled>
              {language === 'he' ? '✦ הסבר בינה מלאכותית' : '✦ Get AI Context'}
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}
