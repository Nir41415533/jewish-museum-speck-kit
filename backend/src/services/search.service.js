const pool = require('../config/db');

async function search({ q, type, limit = 10, offset = 0 }) {
  const safeLimit  = Math.min(Math.max(parseInt(limit,  10) || 10, 1), 50);
  const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);

  const runSoldiers  = !type || type === 'soldier';
  const runEvents    = !type || type === 'event';
  const runCountries = !type || type === 'country';

  const [soldierRes, eventRes, countryRes] = await Promise.all([
    runSoldiers ? pool.query(
      `SELECT id, reference_code, name_en, name_he, rank_en, rank_he, army_en, army_he
       FROM soldiers
       WHERE search_vector_en @@ plainto_tsquery('english', $1)
          OR search_vector_he @@ plainto_tsquery('simple',  $1)
       ORDER BY id ASC
       LIMIT $2 OFFSET $3`,
      [q, safeLimit + 1, safeOffset]
    ) : null,

    runEvents ? pool.query(
      `SELECT e.id, e.title_en, e.title_he, e.start_date, e.end_date,
              c.name_en AS country_name_en, c.name_he AS country_name_he
       FROM events e
       LEFT JOIN countries c ON c.id = e.country_id
       WHERE e.search_vector_en @@ plainto_tsquery('english', $1)
          OR e.search_vector_he @@ plainto_tsquery('simple',  $1)
       ORDER BY e.start_date ASC
       LIMIT $2 OFFSET $3`,
      [q, safeLimit + 1, safeOffset]
    ) : null,

    runCountries ? pool.query(
      `SELECT id, code, name_en, name_he, lat, lng
       FROM countries
       WHERE name_en ILIKE $1 OR name_he ILIKE $1
       ORDER BY name_en ASC
       LIMIT $2 OFFSET $3`,
      [`%${q}%`, safeLimit + 1, safeOffset]
    ) : null,
  ]);

  function paginate(res) {
    if (!res) return undefined;
    const rows    = res.rows;
    const hasMore = rows.length > safeLimit;
    return {
      data: rows.slice(0, safeLimit),
      pagination: { limit: safeLimit, offset: safeOffset, has_more: hasMore },
    };
  }

  return {
    ...(runSoldiers  && { soldiers:  paginate(soldierRes)  }),
    ...(runEvents    && { events:    paginate(eventRes)    }),
    ...(runCountries && { countries: paginate(countryRes)  }),
  };
}

module.exports = { search };
