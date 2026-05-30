// server/routes/experiences.js
const express = require('express');
const pool    = require('../db/pool');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/experiences?section_id=  (public)
router.get('/', async (req, res, next) => {
  try {
    const { section_id } = req.query;
    const query = section_id
      ? 'SELECT * FROM experiences WHERE section_id = $1 ORDER BY display_order ASC'
      : 'SELECT * FROM experiences ORDER BY display_order ASC';
    const params = section_id ? [section_id] : [];

    const { rows } = await pool.query(query, params);
    res.json({ experiences: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/experiences  (admin)
router.post('/', protect, async (req, res, next) => {
  try {
    const {
      section_id, company, role, start_date,
      end_date, bullets = [], logo_url, display_order = 0,
    } = req.body;

    if (!section_id || !company || !role) {
      return res.status(400).json({ error: 'section_id, company, and role are required.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO experiences
         (section_id, company, role, start_date, end_date, bullets, logo_url, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [section_id, company, role, start_date || null, end_date || null, bullets, logo_url, display_order]
    );
    res.status(201).json({ experience: rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/experiences/:id  (admin)
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company, role, start_date, end_date, bullets, logo_url, display_order } = req.body;

    const { rows } = await pool.query(
      `UPDATE experiences SET
         company       = COALESCE($1, company),
         role          = COALESCE($2, role),
         start_date    = COALESCE($3, start_date),
         end_date      = $4,
         bullets       = COALESCE($5, bullets),
         logo_url      = COALESCE($6, logo_url),
         display_order = COALESCE($7, display_order)
       WHERE id = $8
       RETURNING *`,
      [company, role, start_date || null, end_date || null, bullets, logo_url, display_order, id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Experience not found.' });
    res.json({ experience: rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/experiences/:id  (admin)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM experiences WHERE id = $1', [req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Experience not found.' });
    res.json({ message: 'Experience deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
