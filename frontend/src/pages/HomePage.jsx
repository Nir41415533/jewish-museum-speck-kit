import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './HomePage.css';

const YT_VIDEO_ID = 'DULVkVAVoTU';

const copy = {
  en: {
    title: 'Jewish Soldiers in World War II',
    body: 'Explore the stories of Jewish soldiers who served in the Allied forces during World War II. Navigate an interactive world map to discover their biographies, the battles they fought, and the historical events that shaped their lives.',
    cta: 'Explore the Map',
  },
  he: {
    title: 'חיילים יהודים במלחמת העולם השנייה',
    body: 'גלו את סיפוריהם של החיילים היהודים ששירתו בכוחות הברית במהלך מלחמת העולם השנייה. נווטו במפה עולמית אינטראקטיבית לגילוי ביוגרפיות, הקרבות בהם נלחמו והאירועים ההיסטוריים שעיצבו את חייהם.',
    cta: 'גלו את המפה',
  },
};

export default function HomePage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = copy[language];

  // Hide the curtain after the video has had time to autoplay — masks YouTube's
  // loading spinner and any brief player chrome before the video starts
  const [curtainGone, setCurtainGone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setCurtainGone(true), 2800);
    return () => clearTimeout(t);
  }, []);

  const ytSrc =
    `https://www.youtube.com/embed/${YT_VIDEO_ID}` +
    `?autoplay=1&mute=1&loop=1&playlist=${YT_VIDEO_ID}` +
    `&controls=0&showinfo=0&rel=0&modestbranding=1` +
    `&iv_load_policy=3&disablekb=1&fs=0&playsinline=1`;

  return (
    <div className="home-page">
      {/* YouTube video background */}
      <div className="home-video-bg" aria-hidden="true">
        <iframe
          src={ytSrc}
          title="background video"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
        />
        {/* Curtain hides YouTube's loading spinner until the video is playing */}
        <div className={`home-video-curtain${curtainGone ? ' gone' : ''}`} />
      </div>

      {/* Dark overlay for text readability */}
      <div className="home-overlay" aria-hidden="true" />

      {/* Content */}
      <div className="home-content">
        <h1 className="home-title">{t.title}</h1>
        <p className="home-body">{t.body}</p>
        <button className="home-cta" onClick={() => navigate('/map')}>
          {t.cta}
        </button>
      </div>
    </div>
  );
}
