import React from 'react';
import MediaViewer from '../Soldier/MediaViewer';

function fmt(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const REL = {
  birth:   { en: 'Birth country', he: 'ארץ לידה' },
  service: { en: 'Served in',     he: 'שירת ב'   },
  death:   { en: 'Died in',       he: 'נפל ב'     },
  other:   { en: 'Connection',    he: 'קשר'       },
};

export default function SoldierDetail({ soldier, language: lang }) {
  const name     = lang === 'he' ? soldier.name_he     : soldier.name_en;
  const bio      = lang === 'he' ? soldier.biography_he : soldier.biography_en;
  const army     = lang === 'he' ? soldier.army_he      : soldier.army_en;
  const rank     = lang === 'he' ? soldier.rank_he      : soldier.rank_en;
  const role     = lang === 'he' ? soldier.role_he      : soldier.role_en;
  const birthLoc = lang === 'he' ? soldier.birth_location_he : soldier.birth_location_en;
  const deathLoc = lang === 'he' ? soldier.death_location_he : soldier.death_location_en;

  const decorations    = soldier.participations.filter(p => p.type === 'decoration');
  const participations = soldier.participations.filter(p => p.type === 'participation');

  return (
    <div className="detail-inner">
      {/* name + reference */}
      <div className="detail-hero">
        <span className="detail-ref">{soldier.reference_code}</span>
        <h2 className="detail-name">{name}</h2>
        {(rank || army) && (
          <p className="detail-sub">{[rank, army, role].filter(Boolean).join(' · ')}</p>
        )}
      </div>

      {/* vitals */}
      <div className="detail-vitals">
        {soldier.birth_date && (
          <div className="vital">
            <span className="vital-lbl">{lang === 'he' ? 'נולד' : 'Born'}</span>
            <span className="vital-val">{fmt(soldier.birth_date)}{birthLoc ? `, ${birthLoc}` : ''}</span>
          </div>
        )}
        {soldier.death_date && (
          <div className="vital vital-death">
            <span className="vital-lbl">{lang === 'he' ? 'נפל' : 'Died'}</span>
            <span className="vital-val">{fmt(soldier.death_date)}{deathLoc ? `, ${deathLoc}` : ''}</span>
          </div>
        )}
      </div>

      {/* biography */}
      {bio && (
        <div className="detail-section">
          <h3 className="detail-section-title">{lang === 'he' ? 'ביוגרפיה' : 'Biography'}</h3>
          <p className="detail-bio">{bio}</p>
        </div>
      )}

      {/* countries */}
      {soldier.countries.length > 0 && (
        <div className="detail-section">
          <h3 className="detail-section-title">{lang === 'he' ? 'מדינות קשורות' : 'Countries'}</h3>
          <div className="detail-tags">
            {soldier.countries.map(c => (
              <span key={`${c.id}-${c.relationship_type}`} className="detail-tag">
                {lang === 'he' ? c.name_he : c.name_en}
                <em>{REL[c.relationship_type]?.[lang] ?? c.relationship_type}</em>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* decorations */}
      {decorations.length > 0 && (
        <div className="detail-section">
          <h3 className="detail-section-title">{lang === 'he' ? 'עיטורים' : 'Decorations'}</h3>
          <ul className="detail-list">
            {decorations.map(d => (
              <li key={d.id} className="detail-list-item gold-item">
                🎖 {lang === 'he' ? d.name_he : d.name_en}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* participations */}
      {participations.length > 0 && (
        <div className="detail-section">
          <h3 className="detail-section-title">{lang === 'he' ? 'קרבות' : 'Battles'}</h3>
          <ul className="detail-list">
            {participations.map(p => (
              <li key={p.id} className="detail-list-item navy-item">
                ⚔ {lang === 'he' ? p.name_he : p.name_en}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* media */}
      {soldier.media.length > 0 && (
        <div className="detail-section">
          <h3 className="detail-section-title">{lang === 'he' ? 'תמונות' : 'Media'}</h3>
          <MediaViewer media={soldier.media} />
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
