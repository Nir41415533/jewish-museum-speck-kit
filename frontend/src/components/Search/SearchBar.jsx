import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useMap } from '../../context/MapContext';
import { searchApi } from '../../services/api';
import './SearchBar.css';

const DEBOUNCE_MS = 350;
const MIN_CHARS   = 2;
const MAX_PER_GROUP = 4;

export default function SearchBar() {
  const { language } = useLanguage();
  const { setSelectedCountryId, setIsPanelOpen, setSelectedEventId, setSelectedSoldierId, mapRef } = useMap();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [q,        setQ]        = useState('');
  const [results,  setResults]  = useState(null);
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);

  const timerRef    = useRef(null);
  const containerRef = useRef(null);
  const he = language === 'he';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const doSearch = useCallback(async (query) => {
    if (query.length < MIN_CHARS) { setResults(null); setOpen(false); return; }
    setLoading(true);
    try {
      const data = await searchApi.search({ q: query, limit: MAX_PER_GROUP });
      setResults(data);
      setOpen(true);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQ(val);
    clearTimeout(timerRef.current);
    if (val.trim().length < MIN_CHARS) { setResults(null); setOpen(false); return; }
    timerRef.current = setTimeout(() => doSearch(val.trim()), DEBOUNCE_MS);
  }

  function goToMap() {
    if (location.pathname !== '/map') navigate('/map');
  }

  function pickSoldier(s) {
    setOpen(false);
    setQ('');
    setSelectedSoldierId(s.id);
    goToMap();
  }

  function pickEvent(e) {
    setOpen(false);
    setQ('');
    setSelectedEventId(e.id);
    goToMap();
  }

  function pickCountry(c) {
    setOpen(false);
    setQ('');
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [c.lng, c.lat], zoom: 4, duration: 1200 });
    }
    setSelectedCountryId(c.id);
    setIsPanelOpen(true);
    goToMap();
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setOpen(false); setQ(''); }
  }

  const soldiers  = results?.soldiers?.data  ?? [];
  const events    = results?.events?.data    ?? [];
  const countries = results?.countries?.data ?? [];
  const hasAny    = soldiers.length + events.length + countries.length > 0;

  return (
    <div className="sb-wrap" ref={containerRef}>
      <div className="sb-form">
        <input
          className="sb-input"
          type="text"
          autoComplete="off"
          value={q}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results && hasAny) setOpen(true); }}
          placeholder={he ? 'חיפוש…' : 'Search soldiers, events…'}
          aria-label={he ? 'חיפוש' : 'Search'}
          aria-expanded={open}
          aria-haspopup="listbox"
        />
        {loading
          ? <span className="sb-spinner" aria-hidden="true" />
          : <span className="sb-icon" aria-hidden="true">⌕</span>
        }
      </div>

      {open && (
        <div className="sb-dropdown" role="listbox">

          {!hasAny && (
            <p className="sb-empty">{he ? 'אין תוצאות' : 'No results'}</p>
          )}

          {soldiers.length > 0 && (
            <div className="sb-group">
              <span className="sb-group-label">{he ? 'חיילים' : 'SOLDIERS'}</span>
              {soldiers.map(s => (
                <button key={s.id} className="sb-item sb-soldier" onClick={() => pickSoldier(s)} role="option">
                  <span className="sb-item-ref">{s.reference_code}</span>
                  <span className="sb-item-name">{he ? s.name_he : s.name_en}</span>
                  <span className="sb-item-sub">{he ? (s.rank_he || '') : (s.rank_en || '')}</span>
                </button>
              ))}
            </div>
          )}

          {events.length > 0 && (
            <div className="sb-group">
              <span className="sb-group-label">{he ? 'אירועים' : 'EVENTS'}</span>
              {events.map(e => (
                <button key={e.id} className="sb-item sb-event" onClick={() => pickEvent(e)} role="option">
                  <span className="sb-item-ref">{e.start_date?.slice(0, 4)}</span>
                  <span className="sb-item-name">{he ? e.title_he : e.title_en}</span>
                  <span className="sb-item-sub">{he ? e.country_name_he : e.country_name_en}</span>
                </button>
              ))}
            </div>
          )}

          {countries.length > 0 && (
            <div className="sb-group">
              <span className="sb-group-label">{he ? 'מדינות' : 'COUNTRIES'}</span>
              {countries.map(c => (
                <button key={c.id} className="sb-item sb-country" onClick={() => pickCountry(c)} role="option">
                  <span className="sb-item-ref">{c.code}</span>
                  <span className="sb-item-name">{he ? c.name_he : c.name_en}</span>
                </button>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
