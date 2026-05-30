// server/routes/sections.js
// CRUD for dynamic sections + bulk reorder.

const express = require('express');
const pool    = require('../db/pool');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/sections  (public) ──────────────────────────────
// Returns visible sections sorted by display_order.
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, type, title, display_order, is_visible, content
       FROM sections
       WHERE is_visible = TRUE
       ORDER BY display_order ASC`
    );
    res.json({ sections: rows });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/sections/all  (admin — includes hidden) ─────────
router.get('/all', protect, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM sections ORDER BY display_order ASC`
    );
    res.json({ sections: rows });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/sections  (admin) ──────────────────────────────
router.post('/', protect, async (req, res, next) => {
  try {
    const { type, title, display_order = 0, is_visible = true } = req.body;

    if (!type || !title) {
      return res.status(400).json({ error: 'type and title are required.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO sections (type, title, display_order, is_visible)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [type, title, display_order, is_visible]
    );

    res.status(201).json({ section: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/sections/:id  (admin) ───────────────────────────
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, type, display_order, is_visible, content } = req.body;

    const { rows } = await pool.query(
      `UPDATE sections
       SET title         = COALESCE($1, title),
           type          = COALESCE($2, type),
           display_order = COALESCE($3, display_order),
           is_visible    = COALESCE($4, is_visible),
           content       = COALESCE($5, content)
       WHERE id = $6
       RETURNING *`,
      [title, type, display_order, is_visible, content, id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Section not found.' });
    res.json({ section: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/sections/reorder  (admin) ─────────────────────
// Body: { order: [ { id: 1, display_order: 0 }, ... ] }
router.patch('/reorder', protect, async (req, res, next) => {
  const { order } = req.body;

  if (!Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ error: 'order must be a non-empty array.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const item of order) {
      await client.query(
        'UPDATE sections SET display_order = $1 WHERE id = $2',
        [item.display_order, item.id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Sections reordered successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// ─── DELETE /api/sections/:id  (admin) ────────────────────────
// Cascades to certificates / projects / experiences
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      'DELETE FROM sections WHERE id = $1',
      [id]
    );

    if (rowCount === 0) return res.status(404).json({ error: 'Section not found.' });
    res.json({ message: 'Section deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
