// server/db/seed.js
// Creates the single admin account from .env credentials.
// Usage: npm run db:seed   (safe to re-run — uses ON CONFLICT DO NOTHING)

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool   = require('./pool');

async function seed() {
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      '❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding.'
    );
    process.exit(1);
  }

  const hash   = await bcrypt.hash(password, 12);
  const client = await pool.connect();

  try {
    const result = await client.query(
      `INSERT INTO users (email, password)
       VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email`,
      [email, hash]
    );

    if (result.rowCount === 0) {
      console.log(`ℹ️  Admin account already exists for ${email}. Skipped.`);
    } else {
      console.log(`✅ Admin account created: ${result.rows[0].email} (id=${result.rows[0].id})`);
    }
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
