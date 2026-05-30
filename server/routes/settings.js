// server/routes/settings.js
// GET  /api/settings           → public, returns all key/value pairs
// PUT  /api/settings           → 🔐 upsert any key
// POST /api/settings/upload    → 🔐 upload avatar (image) or CV (PDF)
// GET  /api/assets/:key        → public, stream file from Neon BYTEA

const express = require('express');
const multer  = require('multer');
const sharp   = require('sharp');
const pool    = require('../db/pool');
const { protect } = require('../middleware/auth');

const router  = express.Router();

// ─── Multer — memory storage (we process before hitting DB) ───
const MAX_IMAGE = (parseInt(process.env.MAX_IMAGE_SIZE_MB) || 5)  * 1024 * 1024;
const MAX_PDF   = (parseInt(process.env.MAX_PDF_SIZE_MB)   || 10) * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits : { fileSize: Math.max(MAX_IMAGE, MAX_PDF) },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/webp','image/gif','application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP, GIF, and PDF files are allowed.'));
  },
});

// ─── GET /api/settings  (public) ──────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM global_settings');
    // Convert to { hero_title: '...', hero_subtitle: '...', ... }
    const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
    res.json({ settings });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/settings  (admin) ───────────────────────────────
// Body: { key: 'hero_title', value: 'Hello World' }
router.put('/', protect, async (req, res, next) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'key is required.' });

    await pool.query(
      `INSERT INTO global_settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, value ?? '']
    );

    res.json({ message: `Setting "${key}" updated.` });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/settings/upload  (admin) ───────────────────────
// Multipart form: field "file", field "asset_key" ('avatar' | 'cv')
router.post('/upload', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const { asset_key } = req.body;
    if (!asset_key) return res.status(400).json({ error: 'asset_key is required (e.g. "avatar" or "cv").' });

    const { originalname, mimetype, buffer, size } = req.file;
    let processedBuffer = buffer;
    let processedMime   = mimetype;

    // ── Image: compress → WebP ────────────────────────────────
    if (mimetype.startsWith('image/')) {
      if (size > MAX_IMAGE) {
        return res.status(413).json({ error: `Image must be under ${process.env.MAX_IMAGE_SIZE_MB || 5} MB.` });
      }
      processedBuffer = await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true }) // max 1200px wide
        .webp({ quality: 75 })
        .toBuffer();
      processedMime = 'image/webp';
    }

    // ── PDF: size guard only (no recompression) ───────────────
    if (mimetype === 'application/pdf') {
      if (size > MAX_PDF) {
        return res.status(413).json({ error: `PDF must be under ${process.env.MAX_PDF_SIZE_MB || 10} MB.` });
      }
    }

    // ── Upsert into file_assets ────────────────────────────────
    const { rows } = await pool.query(
      `INSERT INTO file_assets (asset_key, filename, mime_type, file_data, file_size, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (asset_key) DO UPDATE SET
         filename   = EXCLUDED.filename,
         mime_type  = EXCLUDED.mime_type,
         file_data  = EXCLUDED.file_data,
         file_size  = EXCLUDED.file_size,
         updated_at = NOW()
       RETURNING id, asset_key, filename, mime_type, file_size, updated_at`,
      [asset_key, originalname, processedMime, processedBuffer, processedBuffer.length]
    );

    // Store reference in global_settings so public can resolve the URL
    await pool.query(
      `INSERT INTO global_settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [`${asset_key}_key`, asset_key]
    );

    const saved = rows[0];
    res.json({
      message : `${asset_key} uploaded and compressed successfully.`,
      asset   : {
        ...saved,
        url       : `/api/assets/${asset_key}`,
        original_size_kb : Math.round(size / 1024),
        saved_size_kb    : Math.round(processedBuffer.length / 1024),
        compression_ratio: `${Math.round((1 - processedBuffer.length / size) * 100)}% smaller`,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/assets/:key  (public) ───────────────────────────
// Streams the file bytes back with correct Content-Type.
router.get('/assets/:key', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT mime_type, file_data, filename FROM file_assets WHERE asset_key = $1',
      [req.params.key]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Asset not found.' });

    const { mime_type, file_data, filename } = rows[0];

    res.set('Content-Type', mime_type);
    res.set('Cache-Control', 'public, max-age=86400'); // 1-day browser cache

    // For PDFs trigger download; for images inline display
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
