// server/db/init.js
// Reads schema.sql and runs it against Neon DB.
// Usage: npm run db:init

require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const pool = require('./pool');

async function init() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql        = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('🚀 Initialising database schema...');
    await client.query(sql);
    console.log('✅ Schema applied successfully.');
  } catch (err) {
    console.error('❌ Schema init failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

init();
