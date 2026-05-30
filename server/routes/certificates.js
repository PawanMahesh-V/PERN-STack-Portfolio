// server/routes/certificates.js
const express = require('express');
const pool    = require('../db/pool');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/certificates?section_id=  (public)
router.get('/', async (req, res, next) => {
  try {
    const { section_id } = req.query;
    const query = section_id
      ? 'SELECT * FROM certificates WHERE section_id = $1 ORDER BY display_order ASC'
      : 'SELECT * FROM certificates ORDER BY display_order ASC';
    const params = section_id ? [section_id] : [];

    const { rows } = await pool.query(query, params);
    res.json({ certificates: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/certificates  (admin)
router.post('/', protect, async (req, res, next) => {
  try {
    const {
      section_id, title, issuer, image_url,
      issue_date, cert_url, display_order = 0,
    } = req.body;

    if (!section_id || !title) {
      return res.status(400).json({ error: 'section_id and title are required.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO certificates
         (section_id, title, issuer, image_url, issue_date, cert_url, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [section_id, title, issuer, image_url, issue_date || null, cert_url, display_order]
    );
    res.status(201).json({ certificate: rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/certificates/:id  (admin)
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, issuer, image_url, issue_date, cert_url, display_order } = req.body;

    const { rows } = await pool.query(
      `UPDATE certificates SET
         title         = COALESCE($1, title),
         issuer        = COALESCE($2, issuer),
         image_url     = COALESCE($3, image_url),
         issue_date    = COALESCE($4, issue_date),
         cert_url      = COALESCE($5, cert_url),
         display_order = COALESCE($6, display_order)
       WHERE id = $7
       RETURNING *`,
      [title, issuer, image_url, issue_date || null, cert_url, display_order, id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Certificate not found.' });
    res.json({ certificate: rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/certificates/:id  (admin)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM certificates WHERE id = $1', [req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Certificate not found.' });
    res.json({ message: 'Certificate deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
