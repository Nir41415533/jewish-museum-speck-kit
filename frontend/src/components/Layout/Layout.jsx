import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Layout.css';

export default function Layout({ children }) {
  const { language } = useLanguage();

  return (
    <div className={`layout${language === 'he' ? ' rtl' : ''}`}>
      <header className="layout-header">
        <span className="layout-site-name">
          {language === 'he' ? 'מוזיאון החייל היהודי' : 'Jewish Soldier Museum'}
        </span>
        {/* LanguageToggle wired in T054 (Phase 8) */}
      </header>
      <main className="layout-main">{children}</main>
    </div>
  );
}
