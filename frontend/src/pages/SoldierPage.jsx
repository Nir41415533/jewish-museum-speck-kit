import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { soldiersApi } from '../services/api';
import MediaViewer from '../components/Soldier/MediaViewer';
import './SoldierPage.css';

function yearOf(dateStr) {
  return dateStr ? dateStr.slice(0, 4) : null;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const RELATIONSHIP_LABELS = {
  birth: { en: 'Birth country', he: 'ארץ לידה' },
  service: { en: 'Served in', he: 'שירת ב' },
  death: { en: 'Died in', he: 'נפל ב' },
  other: { en: 'Connection', he: 'קשר' },
};

export default function SoldierPage() {
  const { id } = useParams();
  const { language } = useLanguage();
  const [soldier, setSoldier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    soldiersApi.getById(id)
      .then(res => setSoldier(res.data))
      .catch(err => setError(err.status === 404 ? 'not_found' : 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="soldier-page">
        <div className="soldier-loading">
          {language === 'he' ? 'טוען תיק חייל…' : 'Loading soldier record…'}
        </div>
      </div>
    );
  }

  if (error === 'not_found') {
    return (
      <div className="soldier-page">
        <div className="soldier-not-found">
          <p>{language === 'he' ? 'חייל לא נמצא' : 'Soldier not found'}</p>
          <Link to="/map" className="back-link">
            {language === 'he' ? '← חזרה למפה' : '← Back to map'}
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="soldier-page">
        <div className="soldier-error">
          {language === 'he' ? 'שגיאה בטעינת הנתונים' : 'Failed to load soldier record'}
        </div>
      </div>
    );
  }

  const name = language === 'he' ? soldier.name_he : soldier.name_en;
  const biography = language === 'he' ? soldier.biography_he : soldier.biography_en;
  const army = language === 'he' ? soldier.army_he : soldier.army_en;
  const rank = language === 'he' ? soldier.rank_he : soldier.rank_en;
  const role = language === 'he' ? soldier.role_he : soldier.role_en;
  const birthLocation = language === 'he' ? soldier.birth_location_he : soldier.birth_location_en;
  const deathLocation = language === 'he' ? soldier.death_location_he : soldier.death_location_en;

  const decorations = soldier.participations.filter(p => p.type === 'decoration');
  const participations = soldier.participations.filter(p => p.type === 'participation');

  return (
    <div className="soldier-page">
      <div className="soldier-dossier">

        {/* Back link */}
        <Link to="/map" className="back-link">
          {language === 'he' ? '← חזרה למפה' : '← Back to map'}
        </Link>

        {/* Header — name + reference code */}
        <header className="dossier-header">
          <span className="dossier-ref">{soldier.reference_code}</span>
          <h1 className="dossier-name">{name}</h1>
          {(army || rank) && (
            <p className="dossier-rank">
              {[rank, army].filter(Boolean).join(' · ')}
              {role ? ` · ${role}` : ''}
            </p>
          )}
        </header>

        <div className="dossier-body">

          {/* Vital dates */}
          <section className="dossier-section vitals-section">
            <div className="vitals-grid">
              {soldier.birth_date && (
                <div className="vital-item">
                  <span className="vital-label">
                    {language === 'he' ? 'נולד' : 'Born'}
                  </span>
                  <span className="vital-value">
                    {formatDate(soldier.birth_date)}
                    {birthLocation ? `, ${birthLocation}` : ''}
                  </span>
                </div>
              )}
              {soldier.death_date && (
                <div className="vital-item vital-death">
                  <span className="vital-label">
                    {language === 'he' ? 'נפל' : 'Died'}
                  </span>
                  <span className="vital-value">
                    {formatDate(soldier.death_date)}
                    {deathLocation ? `, ${deathLocation}` : ''}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Biography */}
          {biography && (
            <section className="dossier-section">
              <h2 className="dossier-section-title">
                {language === 'he' ? 'תולדות חיים' : 'Biography'}
              </h2>
              <p className="dossier-biography">{biography}</p>
            </section>
          )}

          {/* Countries */}
          {soldier.countries.length > 0 && (
            <section className="dossier-section">
              <h2 className="dossier-section-title">
                {language === 'he' ? 'מדינות קשורות' : 'Associated Countries'}
              </h2>
              <ul className="dossier-countries">
                {soldier.countries.map(c => (
                  <li key={`${c.id}-${c.relationship_type}`} className="country-tag">
                    <span className="country-name">
                      {language === 'he' ? c.name_he : c.name_en}
                    </span>
                    <span className="country-rel">
                      {RELATIONSHIP_LABELS[c.relationship_type]?.[language] ?? c.relationship_type}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Decorations */}
          {decorations.length > 0 && (
            <section className="dossier-section">
              <h2 className="dossier-section-title">
                {language === 'he' ? 'עיטורים ומדליות' : 'Decorations & Medals'}
              </h2>
              <ul className="dossier-list">
                {decorations.map(d => (
                  <li key={d.id} className="dossier-list-item decoration-item">
                    🎖 {language === 'he' ? d.name_he : d.name_en}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Participations */}
          {participations.length > 0 && (
            <section className="dossier-section">
              <h2 className="dossier-section-title">
                {language === 'he' ? 'השתתפות בקרבות' : 'Battle Participations'}
              </h2>
              <ul className="dossier-list">
                {participations.map(p => (
                  <li key={p.id} className="dossier-list-item participation-item">
                    ⚔ {language === 'he' ? p.name_he : p.name_en}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Media */}
          {soldier.media.length > 0 && (
            <section className="dossier-section">
              <h2 className="dossier-section-title">
                {language === 'he' ? 'תמונות ווידאו' : 'Photos & Video'}
              </h2>
              <MediaViewer media={soldier.media} />
            </section>
          )}

          {/* AI Context placeholder — wired in T064 (Phase 9) */}
          <section className="dossier-section ai-section">
            <button className="ai-context-btn" disabled>
              {language === 'he' ? '✦ הסבר בינה מלאכותית' : '✦ Get AI Context'}
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}
