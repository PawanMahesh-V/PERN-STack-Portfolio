// server/db/pool.js
// Neon DB connection pool — uses pg with SSL (required by Neon)
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,   // Neon requires verified TLS
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection on startup
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Connected to Neon PostgreSQL');
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected Neon DB error:', err.message);
  process.exit(-1);
});

module.exports = pool;
