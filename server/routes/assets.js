// server/routes/assets.js
// GET /api/assets/:key  → public, stream compressed file from Neon BYTEA

const express = require('express');
const multer  = require('multer');
const sharp   = require('sharp');
const crypto  = require('crypto');
const pool    = require('../db/pool');
const { protect } = require('../middleware/auth');

const router = express.Router();

const MAX_IMAGE = (parseInt(process.env.MAX_IMAGE_SIZE_MB) || 5) * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits : { fileSize: MAX_IMAGE },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/webp','image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP, and GIF files are allowed.'));
  },
});

// ─── POST /api/assets/upload (admin) ─────────────────────────
router.post('/upload', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const { originalname, mimetype, buffer, size } = req.file;
    if (size > MAX_IMAGE) {
      return res.status(413).json({ error: `Image must be under ${process.env.MAX_IMAGE_SIZE_MB || 5} MB.` });
    }

    const processedBuffer = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const assetKey = crypto.randomUUID();

    await pool.query(
      `INSERT INTO file_assets (asset_key, filename, mime_type, file_data, file_size, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [assetKey, originalname, 'image/webp', processedBuffer, processedBuffer.length]
    );

    res.json({
      message: 'Asset uploaded successfully.',
      url: `/api/assets/${assetKey}`
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:key', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT mime_type, file_data, filename FROM file_assets WHERE asset_key = $1',
      [req.params.key]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Asset not found.' });

    const { mime_type, file_data, filename } = rows[0];

    res.set('Content-Type', mime_type);
    res.set('Cache-Control', 'public, max-age=86400'); // 1-day browser cache

    if (mime_type === 'application/pdf') {
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      res.set('Content-Disposition', 'inline');
    }

    res.send(file_data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
