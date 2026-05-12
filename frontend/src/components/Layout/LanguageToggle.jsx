import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageToggle.css';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="lt-wrap" role="group" aria-label="Language selector">
      <button
        className={`lt-btn${language === 'en' ? ' lt-active' : ''}`}
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        lang="en"
      >
        EN
      </button>
      <span className="lt-divider" aria-hidden="true" />
      <button
        className={`lt-btn${language === 'he' ? ' lt-active' : ''}`}
        onClick={() => setLanguage('he')}
        aria-pressed={language === 'he'}
        lang="he"
      >
        HE
      </button>
    </div>
  );
}
