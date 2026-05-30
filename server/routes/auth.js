// server/routes/auth.js
// POST /api/auth/login  → validate credentials, return JWT
// GET  /api/auth/me     → 🔐 verify token, return user profile

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const pool     = require('../db/pool');
const { protect }      = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ─── Helper ───────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ─── POST /api/auth/login ─────────────────────────────────────
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Basic input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 2. Look up user by email
    const result = await pool.query(
      'SELECT id, email, password FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    // 3. Generic error — don't reveal if email exists
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 4. Compare bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 5. Sign & return JWT
    const token = signToken(user);

    res.json({
      token,
      user: { id: user.id, email: user.email },
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', protect, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/auth/change-password ───────────────────────────
router.put('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    const { rows } = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/auth/change-email ──────────────────────────────
router.put('/change-email', protect, async (req, res, next) => {
  try {
    const { currentPassword, newEmail } = req.body;
    if (!currentPassword || !newEmail) {
      return res.status(400).json({ error: 'currentPassword and newEmail are required.' });
    }

    const { rows } = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect.' });

    // Ensure the new email isn't already taken by someone else
    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [newEmail.toLowerCase().trim(), req.user.id]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'This email is already in use.' });
    }

    await pool.query('UPDATE users SET email = $1 WHERE id = $2', [newEmail.toLowerCase().trim(), req.user.id]);

    res.json({ message: 'Email updated successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

