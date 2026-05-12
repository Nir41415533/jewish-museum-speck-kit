import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useMap } from '../context/MapContext';
import { useSearch } from '../hooks/useSearch';
import './SearchPage.css';

function fmtDate(d) {
  if (!d) return null;
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export default function SearchPage() {
  const { language } = useLanguage();
  const { setSelectedCountryId, setIsPanelOpen } = useMap();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const { results, loading, loadingMore, error, search, loadMore } = useSearch();
  const lastQ = useRef(null);

  useEffect(() => {
    if (q && q !== lastQ.current) {
      lastQ.current = q;
      search(q);
    }
  }, [q, search]);

  const he = language === 'he';

  const soldiers  = results?.soldiers;
  const events    = results?.events;
  const countries = results?.countries;

  const totalHits =
    (soldiers?.data.length  || 0) +
    (events?.data.length    || 0) +
    (countries?.data.length || 0);

  const noResults = results && totalHits === 0;

  function openCountry(country) {
    setSelectedCountryId(country.id);
    setIsPanelOpen(true);
    navigate('/map');
  }

  return (
    <div className="sp-page">

      {/* ── Page header ─────────────────────────────── */}
      <div className="sp-header">
        <span className="sp-ref">SEARCH · REF-SR001</span>
        <h1 className="sp-heading">{he ? 'תוצאות חיפוש' : 'Search Results'}</h1>
        {q && (
          <p className="sp-query-label">
            {he ? `שאילתה: ` : `Query: `}
            <span className="sp-query-value">"{q}"</span>
          </p>
        )}
      </div>

      {/* ── Body ────────────────────────────────────── */}
      <div className="sp-body">

        {loading && <p className="sp-status">{he ? 'מחפש…' : 'Searching…'}</p>}
        {error   && <p className="sp-status sp-error">{he ? 'שגיאה בחיפוש' : 'Search failed'}</p>}
        {noResults && (
          <p className="sp-status">{he ? 'לא נמצאו תוצאות — נסה מילות מפתח אחרות' : 'No results found — try different keywords'}</p>
        )}

        {results && !noResults && (
          <div className="sp-results">

            {/* ── Soldiers ────────────────────────── */}
            {soldiers && soldiers.data.length > 0 && (
              <section className="sp-section">
                <div className="sp-section-header">
                  <span className="sp-section-label">{he ? 'חיילים' : 'SOLDIERS'}</span>
                  <span className="sp-section-count">{soldiers.data.length}{soldiers.pagination.has_more ? '+' : ''}</span>
                </div>
                <ul className="sp-list">
                  {soldiers.data.map(s => (
                    <li key={s.id}>
                      <button className="sp-card soldier-card" onClick={() => navigate(`/soldier/${s.id}`)}>
                        <div className="sp-card-band">
                          <span className="sp-card-ref">{s.reference_code}</span>
                          <span className="sp-card-badge">{he ? (s.rank_he || 'חייל') : (s.rank_en || 'SOLDIER')}</span>
                        </div>
                        <div className="sp-card-body">
                          <span className="sp-card-title">{he ? s.name_he : s.name_en}</span>
                          {(s.army_en || s.army_he) && (
                            <span className="sp-card-meta">{he ? s.army_he : s.army_en}</span>
                          )}
                        </div>
                        <span className="sp-card-arrow">›</span>
                      </button>
                    </li>
                  ))}
                </ul>
                {soldiers.pagination.has_more && (
                  <button
                    className="sp-load-more"
                    onClick={() => loadMore('soldiers', q)}
                    disabled={loadingMore === 'soldiers'}
                  >
                    {loadingMore === 'soldiers' ? (he ? 'טוען…' : 'Loading…') : (he ? 'טען עוד' : 'Load more')}
                  </button>
                )}
              </section>
            )}

            {/* ── Events ──────────────────────────── */}
            {events && events.data.length > 0 && (
              <section className="sp-section">
                <div className="sp-section-header">
                  <span className="sp-section-label">{he ? 'אירועים' : 'EVENTS'}</span>
                  <span className="sp-section-count">{events.data.length}{events.pagination.has_more ? '+' : ''}</span>
                </div>
                <ul className="sp-list">
                  {events.data.map(e => {
                    const start = fmtDate(e.start_date);
                    const end   = e.end_date ? fmtDate(e.end_date) : null;
                    const country = he ? e.country_name_he : e.country_name_en;
                    return (
                      <li key={e.id}>
                        <button className="sp-card event-card" onClick={() => navigate(`/event/${e.id}`)}>
                          <div className="sp-card-band">
                            <span className="sp-card-ref">{start}{end ? ` – ${end}` : ''}</span>
                            <span className="sp-card-badge">{he ? 'אירוע' : 'EVENT'}</span>
                          </div>
                          <div className="sp-card-body">
                            <span className="sp-card-title">{he ? e.title_he : e.title_en}</span>
                            {country && <span className="sp-card-meta">📍 {country}</span>}
                          </div>
                          <span className="sp-card-arrow">›</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {events.pagination.has_more && (
                  <button
                    className="sp-load-more"
                    onClick={() => loadMore('events', q)}
                    disabled={loadingMore === 'events'}
                  >
                    {loadingMore === 'events' ? (he ? 'טוען…' : 'Loading…') : (he ? 'טען עוד' : 'Load more')}
                  </button>
                )}
              </section>
            )}

            {/* ── Countries ───────────────────────── */}
            {countries && countries.data.length > 0 && (
              <section className="sp-section">
                <div className="sp-section-header">
                  <span className="sp-section-label">{he ? 'מדינות' : 'COUNTRIES'}</span>
                  <span className="sp-section-count">{countries.data.length}{countries.pagination.has_more ? '+' : ''}</span>
                </div>
                <ul className="sp-list">
                  {countries.data.map(c => (
                    <li key={c.id}>
                      <button className="sp-card country-card" onClick={() => openCountry(c)}>
                        <div className="sp-card-band">
                          <span className="sp-card-ref">{c.code}</span>
                          <span className="sp-card-badge">{he ? 'מדינה' : 'COUNTRY'}</span>
                        </div>
                        <div className="sp-card-body">
                          <span className="sp-card-title">{he ? c.name_he : c.name_en}</span>
                        </div>
                        <span className="sp-card-arrow">›</span>
                      </button>
                    </li>
                  ))}
                </ul>
                {countries.pagination.has_more && (
                  <button
                    className="sp-load-more"
                    onClick={() => loadMore('countries', q)}
                    disabled={loadingMore === 'countries'}
                  >
                    {loadingMore === 'countries' ? (he ? 'טוען…' : 'Loading…') : (he ? 'טען עוד' : 'Load more')}
                  </button>
                )}
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
