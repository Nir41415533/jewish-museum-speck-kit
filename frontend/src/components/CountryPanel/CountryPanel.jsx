import { useMap } from '../../context/MapContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCountryData } from '../../hooks/useCountryData';
import './CountryPanel.css';

function yearOf(dateStr) {
  return dateStr ? dateStr.slice(0, 4) : null;
}

export default function CountryPanel() {
  const { selectedCountryId, isPanelOpen, setIsPanelOpen } = useMap();
  const { language } = useLanguage();
  const { country, soldiers, events, hasMoreSoldiers, loadMoreSoldiers, loading, error } =
    useCountryData(selectedCountryId);

  const name = country
    ? (language === 'he' ? country.name_he : country.name_en)
    : '';

  return (
    <aside className={`country-panel${isPanelOpen ? ' open' : ''}`}>
      <div className="panel-header">
        <h2 className="panel-title">{name || ' '}</h2>
        <button
          className="panel-close"
          onClick={() => setIsPanelOpen(false)}
          aria-label={language === 'he' ? 'סגור' : 'Close'}
        >
          ✕
        </button>
      </div>

      <div className="panel-body">
        {loading && (
          <p className="panel-status">{language === 'he' ? 'טוען…' : 'Loading…'}</p>
        )}
        {error && (
          <p className="panel-status panel-error">
            {language === 'he' ? 'שגיאה בטעינת הנתונים' : 'Failed to load data'}
          </p>
        )}

        {!loading && !error && (
          <>
            {/* AI context button placeholder — wired in T064 (Phase 9) */}

            <section className="panel-section">
              <h3 className="panel-section-title">
                {language === 'he' ? 'חיילים' : 'Soldiers'}
              </h3>
              {soldiers.length === 0 ? (
                <p className="panel-empty">
                  {language === 'he'
                    ? 'אין חיילים מתועדים לארץ זו'
                    : 'No soldiers recorded for this country'}
                </p>
              ) : (
                <>
                  <ul className="panel-list">
                    {soldiers.map(s => (
                      <li key={s.id} className="panel-list-item">
                        {/* Soldier name becomes a link in T038 (Phase 4) */}
                        <span className="item-name">
                          {language === 'he' ? s.name_he : s.name_en}
                        </span>
                        {s.rank_en && (
                          <span className="item-meta">
                            {language === 'he' ? s.rank_he : s.rank_en}
                            {s.army_en ? ` · ${language === 'he' ? s.army_he : s.army_en}` : ''}
                          </span>
                        )}
                        {(s.birth_date || s.death_date) && (
                          <span className="item-dates">
                            {yearOf(s.birth_date)}
                            {s.death_date ? `–${yearOf(s.death_date)}` : ''}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {hasMoreSoldiers && (
                    <button className="panel-load-more" onClick={loadMoreSoldiers}>
                      {language === 'he' ? 'טען עוד' : 'Load more'}
                    </button>
                  )}
                </>
              )}
            </section>

            <section className="panel-section">
              <h3 className="panel-section-title">
                {language === 'he' ? 'אירועים היסטוריים' : 'Historical Events'}
              </h3>
              {events.length === 0 ? (
                <p className="panel-empty">
                  {language === 'he'
                    ? 'אין אירועים מתועדים לארץ זו'
                    : 'No events recorded for this country'}
                </p>
              ) : (
                <ul className="panel-list">
                  {events.map(e => (
                    <li key={e.id} className="panel-list-item">
                      {/* Event title becomes a link in T042 (Phase 5) */}
                      <span className="item-name">
                        {language === 'he' ? e.title_he : e.title_en}
                      </span>
                      <span className="item-dates">
                        {yearOf(e.start_date)}
                        {e.end_date ? `–${yearOf(e.end_date)}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </aside>
  );
}
