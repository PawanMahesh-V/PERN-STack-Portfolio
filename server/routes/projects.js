// server/routes/projects.js
const express = require('express');
const multer  = require('multer');
const sharp   = require('sharp');
const pool    = require('../db/pool');
const { protect } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/projects/upload-image  (admin) ─────────────────────
router.post('/upload-image', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });

    const assetKey = `project_${Date.now()}`;
    const compressed = await sharp(req.file.buffer)
      .resize({ width: 900, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    await pool.query(
      `INSERT INTO file_assets (asset_key, data, mime_type, original_name, file_size)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (asset_key) DO UPDATE
         SET data = EXCLUDED.data, mime_type = EXCLUDED.mime_type,
             original_name = EXCLUDED.original_name, file_size = EXCLUDED.file_size`,
      [assetKey, compressed, 'image/webp', req.file.originalname, compressed.length]
    );

    res.json({ url: `/api/assets/${assetKey}`, asset_key: assetKey });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects?section_id=  (public)
router.get('/', async (req, res, next) => {
  try {
    const { section_id } = req.query;
    const query = section_id
      ? 'SELECT * FROM projects WHERE section_id = $1 ORDER BY display_order ASC'
      : 'SELECT * FROM projects ORDER BY display_order ASC';
    const params = section_id ? [section_id] : [];

    const { rows } = await pool.query(query, params);
    res.json({ projects: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects  (admin)
router.post('/', protect, async (req, res, next) => {
  try {
    const {
      section_id, title, description,
      tech_stack = [], github_url, live_url, image_url, display_order = 0,
    } = req.body;

    if (!section_id || !title) {
      return res.status(400).json({ error: 'section_id and title are required.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO projects
         (section_id, title, description, tech_stack, github_url, live_url, image_url, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [section_id, title, description, tech_stack, github_url, live_url, image_url, display_order]
    );
    res.status(201).json({ project: rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id  (admin)
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title, description, tech_stack,
      github_url, live_url, image_url, display_order,
    } = req.body;

    const { rows } = await pool.query(
      `UPDATE projects SET
         title         = COALESCE($1, title),
         description   = COALESCE($2, description),
         tech_stack    = COALESCE($3, tech_stack),
         github_url    = COALESCE($4, github_url),
         live_url      = COALESCE($5, live_url),
         image_url     = COALESCE($6, image_url),
         display_order = COALESCE($7, display_order)
       WHERE id = $8
       RETURNING *`,
      [title, description, tech_stack, github_url, live_url, image_url, display_order, id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Project not found.' });
    res.json({ project: rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id  (admin)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Project not found.' });
    res.json({ message: 'Project deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
