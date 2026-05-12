import React from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import SearchBar from '../Search/SearchBar';
import './Layout.css';

export default function Layout({ children }) {
  const { language } = useLanguage();
  const { pathname } = useLocation();

  return (
    <div className={`layout${language === 'he' ? ' rtl' : ''}`}>
      <header className="layout-header">
        <span className="layout-site-name">
          {language === 'he' ? 'מוזיאון החייל היהודי' : 'Jewish Soldier Museum'}
        </span>
        {pathname !== '/' && <SearchBar />}
        {/* LanguageToggle wired in T054 (Phase 8) */}
      </header>
      <main className="layout-main">{children}</main>
    </div>
  );
}
