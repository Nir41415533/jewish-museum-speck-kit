const pool = require('../config/db');

async function listInteractive() {
  const { rows } = await pool.query(`
    SELECT DISTINCT c.id, c.code, c.name_en, c.name_he, c.lat, c.lng, c.flag_url
    FROM countries c
    WHERE EXISTS (SELECT 1 FROM soldier_countries sc WHERE sc.country_id = c.id)
       OR EXISTS (SELECT 1 FROM events e WHERE e.country_id = c.id)
    ORDER BY c.id
  `);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, code, name_en, name_he, lat, lng, flag_url FROM countries WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function getSoldiers(countryId, { limit = 20, after = null } = {}) {
  const cap = Math.min(Number(limit) || 20, 100);
  const params = [countryId, cap + 1];
  let cursorClause = '';
  if (after != null) {
    params.push(Number(after));
    cursorClause = `AND s.id > $${params.length}`;
  }

  const { rows } = await pool.query(`
    SELECT s.id, s.reference_code, s.name_en, s.name_he,
           s.birth_date, s.death_date, s.army_en, s.army_he, s.rank_en, s.rank_he,
           array_agg(DISTINCT sc.relationship_type ORDER BY sc.relationship_type) AS relationship_types
    FROM soldiers s
    JOIN soldier_countries sc ON sc.soldier_id = s.id
    WHERE sc.country_id = $1 ${cursorClause}
    GROUP BY s.id
    ORDER BY s.id ASC
    LIMIT $2
  `, params);

  const hasMore = rows.length > cap;
  const data = hasMore ? rows.slice(0, cap) : rows;
  return {
    data,
    pagination: {
      limit: cap,
      next_cursor: hasMore ? data[data.length - 1].id : null,
      has_more: hasMore,
    },
  };
}

async function getEvents(countryId) {
  const { rows } = await pool.query(`
    SELECT id, title_en, title_he, start_date, end_date, country_id
    FROM events
    WHERE country_id = $1
    ORDER BY start_date ASC
  `, [countryId]);
  return rows;
}

module.exports = { listInteractive, findById, getSoldiers, getEvents };
