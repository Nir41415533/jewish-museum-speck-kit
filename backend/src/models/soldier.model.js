const pool = require('../config/db');

async function findById(id) {
  const soldierRes = await pool.query(
    `SELECT id, reference_code, name_en, name_he,
            birth_date, birth_location_en, birth_location_he,
            biography_en, biography_he,
            army_en, army_he, rank_en, rank_he, role_en, role_he,
            death_date, death_location_en, death_location_he
     FROM soldiers WHERE id = $1`,
    [id]
  );
  if (!soldierRes.rows[0]) return null;
  const soldier = soldierRes.rows[0];

  const [countriesRes, participationsRes, mediaRes] = await Promise.all([
    pool.query(
      `SELECT c.id, c.name_en, c.name_he, sc.relationship_type
       FROM soldier_countries sc
       JOIN countries c ON c.id = sc.country_id
       WHERE sc.soldier_id = $1
       ORDER BY c.id`,
      [id]
    ),
    pool.query(
      `SELECT id, type, name_en, name_he, display_order
       FROM soldier_participations
       WHERE soldier_id = $1
       ORDER BY display_order`,
      [id]
    ),
    pool.query(
      `SELECT id, media_type, url, caption_en, caption_he, display_order
       FROM media
       WHERE entity_type = 'soldier' AND entity_id = $1
       ORDER BY display_order`,
      [id]
    ),
  ]);

  return {
    ...soldier,
    countries: countriesRes.rows,
    participations: participationsRes.rows,
    media: mediaRes.rows,
  };
}

module.exports = { findById };
