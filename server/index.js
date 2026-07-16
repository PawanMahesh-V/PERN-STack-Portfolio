// server/index.js
// Express entry point — registers all middleware and routes.

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const path         = require('path');

const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// ─── Route imports ─────────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const settingsRoutes     = require('./routes/settings');
const assetsRoutes       = require('./routes/assets');
const sectionsRoutes     = require('./routes/sections');
const projectsRoutes     = require('./routes/projects');
const certificatesRoutes = require('./routes/certificates');
const experiencesRoutes  = require('./routes/experiences');
const contactRoutes      = require('./routes/contact');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security middleware ───────────────────────────────────────
app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ─── Body parsers ──────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Global rate limit (all API routes) ───────────────────────
app.use('/api', apiLimiter);

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/settings',     settingsRoutes);
app.use('/api/assets',       assetsRoutes);
app.use('/api/sections',     sectionsRoutes);
app.use('/api/projects',     projectsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/experiences',  experiencesRoutes);
app.use('/api/contact',      contactRoutes);

// ─── Analytics — log public page views ────────────────────────
const pool = require('./db/pool');
app.post('/api/analytics/visit', (req, res, next) => {
  pool.query(
    `INSERT INTO page_views (path, user_agent, visited_at) VALUES ($1, $2, NOW())`,
    [req.body.path || '/', req.get('user-agent') || '']
  ).catch(console.error);
  res.status(200).json({ ok: true });
});

// ─── GET /api/resume/data  (public) ───────────────────────────
// Returns all portfolio data needed to render the resume page
app.get('/api/resume/data', async (req, res, next) => {
  try {
    const [settings, experiences, projects, certificates, sections] = await Promise.all([
      pool.query('SELECT key, value FROM global_settings'),
      pool.query(`SELECT * FROM experiences ORDER BY
        CASE WHEN end_date IS NULL THEN 0 ELSE 1 END,
        end_date DESC, start_date DESC`),
      pool.query('SELECT * FROM projects ORDER BY display_order ASC LIMIT 8'),
      pool.query('SELECT * FROM certificates ORDER BY issue_date DESC'),
      pool.query(`SELECT * FROM sections WHERE is_visible = TRUE ORDER BY display_order ASC`),
    ]);

    res.json({
      settings:     Object.fromEntries(settings.rows.map(r => [r.key, r.value])),
      experiences:  experiences.rows,
      projects:     projects.rows,
      certificates: certificates.rows,
      sections:     sections.rows,
    });
  } catch (err) {
    next(err);
  }
});


const { protect: authProtect } = require('./middleware/auth');
app.get('/api/analytics/views', authProtect, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR(d::date, 'YYYY-MM-DD') AS day,
        COUNT(pv.id)::int AS visits
      FROM generate_series(
        NOW() - INTERVAL '6 days', NOW(), INTERVAL '1 day'
      ) AS d
      LEFT JOIN page_views pv
        ON pv.visited_at::date = d::date
      GROUP BY d
      ORDER BY d ASC
    `);
    res.json({ daily: rows.map(r => r.visits) });
  } catch (err) {
    next(err);
  }
});


const PDFDocument = require('pdfkit');

app.get('/api/export/all', authProtect, async (req, res, next) => {
  try {
    const [settings, sections, projects, certs, experiences, messages] = await Promise.all([
      pool.query('SELECT key, value FROM global_settings'),
      pool.query('SELECT * FROM sections ORDER BY display_order ASC'),
      pool.query('SELECT * FROM projects ORDER BY display_order ASC'),
      pool.query('SELECT * FROM certificates ORDER BY display_order ASC'),
      pool.query('SELECT * FROM experiences ORDER BY start_date DESC'),
      pool.query('SELECT id, name, email, message, is_read, sent_at FROM contact_messages ORDER BY sent_at DESC'),
    ]);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="portfolio-backup-${Date.now()}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#1e1b4b').text('Portfolio Full Backup', { align: 'center' });
    doc.fontSize(10).fillColor('#64748b').text(`Exported at: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Helper for sections
    const renderSection = (title, items, renderItem) => {
      if (!items || items.length === 0) return;
      doc.fontSize(18).fillColor('#4f46e5').text(title, { underline: true }).moveDown(0.5);
      items.forEach(item => { renderItem(item); doc.moveDown(0.5); });
      doc.moveDown(1);
    };

    // 1. Settings
    renderSection('Global Settings', settings.rows, s => {
      doc.fontSize(11).fillColor('#1e1b4b').text(`${s.key}: `, { continued: true }).fillColor('#374151').text(String(s.value).replace(/<[^>]*>/g, '').slice(0, 150));
    });

    // 2. Inbox Messages
    renderSection('Inbox Messages', messages.rows, m => {
      doc.fontSize(12).fillColor('#1e1b4b').text(`From: ${m.name} (${m.email})`, { continued: true })
         .fillColor('#64748b').fontSize(10).text(`  •  ${new Date(m.sent_at).toLocaleDateString()}`);
      doc.fontSize(11).fillColor('#374151').text(`Message: ${m.message}`);
    });

    // 3. Projects
    renderSection('Projects', projects.rows, p => {
      doc.fontSize(12).fillColor('#1e1b4b').text(p.title);
      if (p.description) doc.fontSize(10).fillColor('#374151').text(p.description);
      if (p.tech_stack)  doc.fontSize(9).fillColor('#4f46e5').text(`Stack: ${p.tech_stack.join(', ')}`);
    });

    // 4. Experience
    renderSection('Work Experience', experiences.rows, e => {
      doc.fontSize(12).fillColor('#1e1b4b').text(`${e.role} at ${e.company}`);
      if (e.bullets && e.bullets.length) e.bullets.forEach(b => doc.fontSize(10).fillColor('#374151').text(`• ${b}`, { indent: 10 }));
    });

    // 5. Certificates
    renderSection('Certificates', certs.rows, c => {
      doc.fontSize(12).fillColor('#1e1b4b').text(`${c.title} - ${c.issuer}`);
    });

    doc.end();
  } catch (err) {
    next(err);
  }
});


// ─── Serve React build in production ──────────────────────────
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(buildPath));

  // SPA fallback — React Router handles all non-API paths
  app.get('*', (_req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// ─── 404 handler (API routes only) ────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

// ─── Centralised error handler (must be last) ─────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Admin path  : /phantom (frontend only)\n`);
});

module.exports = app;
