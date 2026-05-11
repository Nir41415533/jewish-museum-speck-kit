const pool = require('../config/db');

async function findById(id) {
  const eventRes = await pool.query(
    `SELECT e.id, e.title_en, e.title_he, e.start_date, e.end_date,
            e.description_en, e.description_he,
            c.id   AS country_id,   c.code        AS country_code,
            c.name_en AS country_name_en, c.name_he AS country_name_he,
            c.lat, c.lng, c.flag_url
     FROM events e
     LEFT JOIN countries c ON c.id = e.country_id
     WHERE e.id = $1`,
    [id]
  );
  if (!eventRes.rows[0]) return null;

  const row = eventRes.rows[0];

  const mediaRes = await pool.query(
    `SELECT id, media_type, url, caption_en, caption_he, display_order
     FROM media
     WHERE entity_type = 'event' AND entity_id = $1
     ORDER BY display_order`,
    [id]
  );

  const { country_id, country_code, country_name_en, country_name_he, lat, lng, flag_url, ...event } = row;

  return {
    ...event,
    country: country_id
      ? { id: country_id, code: country_code, name_en: country_name_en, name_he: country_name_he, lat, lng, flag_url }
      : null,
    media: mediaRes.rows,
  };
}

module.exports = { findById };
