import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './MediaViewer.css';

export default function MediaViewer({ media }) {
  const { language } = useLanguage();
  if (!media || media.length === 0) return null;

  return (
    <div className="media-viewer">
      {media.map(item => (
        <figure key={item.id} className="media-item">
          {item.media_type === 'image' ? (
            <img
              src={item.url}
              alt={language === 'he' ? item.caption_he : item.caption_en}
              className="media-img"
            />
          ) : (
            <video src={item.url} controls className="media-video" />
          )}
          {(item.caption_en || item.caption_he) && (
            <figcaption className="media-caption">
              {language === 'he' ? item.caption_he : item.caption_en}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
