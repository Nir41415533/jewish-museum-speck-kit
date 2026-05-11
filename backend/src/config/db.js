const { Pool, types } = require('pg');

// Return DATE columns as plain strings (YYYY-MM-DD) to avoid UTC timezone shifts
types.setTypeParser(1082, val => val);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
