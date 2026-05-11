import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './HomePage.css';

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

  return (
    <div className="home-page">
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
