import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './SearchBar.css';

export default function SearchBar() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (q.trim().length < 2) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form className="searchbar-form" onSubmit={handleSubmit} role="search">
      <input
        className="searchbar-input"
        type="search"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder={language === 'he' ? 'חיפוש…' : 'Search soldiers, events…'}
        aria-label={language === 'he' ? 'חיפוש' : 'Search'}
        minLength={2}
      />
      <button className="searchbar-btn" type="submit" aria-label={language === 'he' ? 'חפש' : 'Search'}>
        ⌕
      </button>
    </form>
  );
}
