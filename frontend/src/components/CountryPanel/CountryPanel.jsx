import React, { useState, useEffect } from 'react';
import { useMap } from '../../context/MapContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCountryData } from '../../hooks/useCountryData';
import { soldiersApi, eventsApi } from '../../services/api';
import SoldierDetail from './SoldierDetail';
import EventDetail from './EventDetail';
import './CountryPanel.css';

function yearOf(dateStr) {
  return dateStr ? dateStr.slice(0, 4) : null;
}

export default function CountryPanel() {
  const { selectedCountryId, isPanelOpen, setIsPanelOpen } = useMap();
  const { language } = useLanguage();
  const { country, soldiers, events, hasMoreSoldiers, loadMoreSoldiers, loading, error } =
    useCountryData(selectedCountryId);

  // Internal modal view: 'list' | 'soldier' | 'event'
  const [view, setView]               = useState('list');
  const [detailId, setDetailId]       = useState(null);
  const [detail, setDetail]           = useState(null);
  const [detailLoading, setDLoading]  = useState(false);
  const [detailError, setDError]      = useState(false);

  // Reset to list view whenever a new country is selected or modal closes
  useEffect(() => {
    setView('list');
    setDetailId(null);
    setDetail(null);
  }, [selectedCountryId]);

  // Fetch soldier or event when drill-down is triggered
  useEffect(() => {
    if (view === 'list' || !detailId) return;
    setDLoading(true);
    setDError(false);
    setDetail(null);
    const api = view === 'soldier' ? soldiersApi : eventsApi;
    api.getById(detailId)
      .then(res => setDetail(res.data))
      .catch(() => setDError(true))
      .finally(() => setDLoading(false));
  }, [view, detailId]);

  function openSoldier(id) {
    setView('soldier');
    setDetailId(id);
  }

  function openEvent(id) {
    setView('event');
    setDetailId(id);
  }

  function goBack() {
    setView('list');
    setDetailId(null);
    setDetail(null);
  }

  function handleClose() {
    setIsPanelOpen(false);
    goBack();
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) handleClose();
  }

  const name = country
    ? (language === 'he' ? country.name_he : country.name_en)
    : '';

  const headerTitle = view === 'list'
    ? name
    : view === 'soldier' && detail
      ? (language === 'he' ? detail.name_he : detail.name_en)
      : view === 'event' && detail
        ? (language === 'he' ? detail.title_he : detail.title_en)
        : name;

  return (
    <div
      className={`country-modal-backdrop${isPanelOpen ? ' open' : ''}`}
      onClick={handleBackdropClick}
    >
      <aside className="country-panel">

        {/* Header */}
        <div className="panel-header">
          <div className="panel-header-inner">
            {view !== 'list' && (
              <button className="panel-back-btn" onClick={goBack} aria-label={language === 'he' ? 'חזרה' : 'Back'}>
                ‹
              </button>
            )}
            <span className={`panel-category${view === 'soldier' ? ' cat-personnel' : view === 'event' ? ' cat-incident' : ''}`}>
              {view === 'list' ? 'COUNTRY FILE' : view === 'soldier' ? 'PERSONNEL' : 'INCIDENT'}
            </span>
            <h2 className="panel-title">{headerTitle || ' '}</h2>
          </div>
          <button
            className="panel-close"
            onClick={handleClose}
            aria-label={language === 'he' ? 'סגור' : 'Close'}
          >
            ✕
          </button>
        </div>

        {/* File reference bar */}
        <div className="panel-fileref">
          <span className="fileref-code">
            REF-{String(selectedCountryId || '0').padStart(4, '0')}
          </span>
          <span className="fileref-label">CONFIDENTIAL — DO NOT DISTRIBUTE</span>
          <span className="fileref-date">{new Date().getFullYear()}</span>
        </div>

        {/* ── LIST VIEW ──────────────────────────────────────────── */}
        {view === 'list' && (
          <>
            {loading && (
              <p className="panel-status">{language === 'he' ? 'טוען…' : 'Loading…'}</p>
            )}
            {error && (
              <p className="panel-status panel-error">
                {language === 'he' ? 'שגיאה בטעינת הנתונים' : 'Failed to load data'}
              </p>
            )}

            {!loading && !error && (
              <div className="panel-columns">
                {/* LEFT: Events */}
                <section className="panel-column panel-column-events">
                  <h3 className="panel-section-title">
                    <span className="section-icon">📅</span>
                    {language === 'he' ? 'אירועים היסטוריים' : 'Historical Events'}
                  </h3>
                  {events.length === 0 ? (
                    <p className="panel-empty">
                      {language === 'he' ? 'אין אירועים מתועדים לארץ זו' : 'No events recorded for this country'}
                    </p>
                  ) : (
                    <ul className="panel-list">
                      {events.map(e => (
                        <li key={e.id}>
                          <button className="panel-card event-card" onClick={() => openEvent(e.id)}>
                            <div className="card-band">
                              <span className="card-band-text">
                                {yearOf(e.start_date)}{e.end_date ? `–${yearOf(e.end_date)}` : ''}
                              </span>
                              <span className="card-band-badge">EVENT</span>
                            </div>
                            <div className="card-body">
                              <div className="card-title-row">
                                <span className="card-title">
                                  {language === 'he' ? e.title_he : e.title_en}
                                </span>
                                <span className="card-arrow">›</span>
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* RIGHT: Soldiers */}
                <section className="panel-column panel-column-soldiers">
                  <h3 className="panel-section-title">
                    <span className="section-icon">🎖</span>
                    {language === 'he' ? 'חיילים' : 'Soldiers'}
                  </h3>
                  {soldiers.length === 0 ? (
                    <p className="panel-empty">
                      {language === 'he' ? 'אין חיילים מתועדים לארץ זו' : 'No soldiers recorded for this country'}
                    </p>
                  ) : (
                    <>
                      <ul className="panel-list">
                        {soldiers.map(s => (
                          <li key={s.id}>
                            <button className="panel-card soldier-card" onClick={() => openSoldier(s.id)}>
                              <div className="card-band">
                                <span className="card-band-text">
                                  {s.rank_en ? (language === 'he' ? s.rank_he : s.rank_en) : 'SOLDIER'}
                                </span>
                                <span className="card-band-badge">PERSONNEL</span>
                              </div>
                              <div className="card-body">
                                <div className="card-title-row">
                                  <span className="card-title">
                                    {language === 'he' ? s.name_he : s.name_en}
                                  </span>
                                  <span className="card-arrow">›</span>
                                </div>
                                {s.army_en && (
                                  <span className="card-meta">
                                    {language === 'he' ? s.army_he : s.army_en}
                                  </span>
                                )}
                                {(s.birth_date || s.death_date) && (
                                  <span className="card-dates">
                                    {yearOf(s.birth_date)}{s.death_date ? `–${yearOf(s.death_date)}` : ''}
                                  </span>
                                )}
                              </div>
                            </button>
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
              </div>
            )}
          </>
        )}

        {/* ── DETAIL VIEW (soldier or event) ─────────────────────── */}
        {view !== 'list' && (
          <div className="panel-detail">
            {detailLoading && (
              <p className="panel-status">{language === 'he' ? 'טוען…' : 'Loading…'}</p>
            )}
            {detailError && (
              <p className="panel-status panel-error">
                {language === 'he' ? 'שגיאה בטעינת הנתונים' : 'Failed to load'}
              </p>
            )}
            {detail && view === 'soldier' && (
              <SoldierDetail soldier={detail} language={language} />
            )}
            {detail && view === 'event' && (
              <EventDetail event={detail} language={language} />
            )}
          </div>
        )}

      </aside>
    </div>
  );
}
