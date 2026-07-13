// reset-admin.js  — run once to reset the admin password
// Usage: node reset-admin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool   = require('./db/pool');

async function resetAdmin() {
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  console.log(`\n🔐 Resetting admin account...`);
  console.log(`   Email    : ${email}`);
  console.log(`   Password : ${password}`);

  try {
    const hash = await bcrypt.hash(password, 12);

    // Try update first
    const updated = await pool.query(
      `UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email`,
      [hash, email.toLowerCase().trim()]
    );

    if (updated.rowCount > 0) {
      console.log(`\n✅ Password reset for: ${updated.rows[0].email} (id=${updated.rows[0].id})`);
    } else {
      // User doesn't exist — insert fresh
      const inserted = await pool.query(
        `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email`,
        [email.toLowerCase().trim(), hash]
      );
      console.log(`\n✅ Admin account created: ${inserted.rows[0].email} (id=${inserted.rows[0].id})`);
    }

    console.log(`\n🚀 You can now login at /phantom with:`);
    console.log(`   Email    : ${email}`);
    console.log(`   Password : ${password}\n`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetAdmin();
