// server/routes/contact.js
// POST /api/contact                      → public, send email + store message
// GET  /api/contact/messages             → 🔐 admin inbox
// PATCH /api/contact/messages/:id/read   → 🔐 mark message as read

const express      = require('express');
const nodemailer   = require('nodemailer');
const pool         = require('../db/pool');
const { protect }        = require('../middleware/auth');
const { contactLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ─── Nodemailer transporter (Gmail SMTP) ──────────────────────
const transporter = nodemailer.createTransport({
  host  : process.env.SMTP_HOST || 'smtp.gmail.com',
  port  : parseInt(process.env.SMTP_PORT) || 587,
  secure: false,                // STARTTLS
  auth  : {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false }, // avoid cert issues in dev
});

// Verify SMTP connection on startup (non-blocking)
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter.verify().then(() => {
    console.log('✅ SMTP transporter ready');
  }).catch((err) => {
    console.warn('⚠️  SMTP verification failed (emails will not send):', err.message);
  });
}

// ─── POST /api/contact  (public, rate-limited) ────────────────
router.post('/', contactLimiter, async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, and message are required.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }
    if (message.trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters.' });
    }

    // 1. Store in DB
    await pool.query(
      `INSERT INTO contact_messages (name, email, message)
       VALUES ($1, $2, $3)`,
      [name.trim(), email.toLowerCase().trim(), message.trim()]
    );

    // 2. Send email notification to admin (fire-and-forget)
    transporter.sendMail({
      from   : `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to     : process.env.CONTACT_RECEIVER,
      replyTo: email,
      subject: `📬 New message from ${name}`,
      html   : `
        <div style="font-family:sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#4f46e5">New Portfolio Contact</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr/>
          <p style="white-space:pre-wrap">${message}</p>
        </div>
      `,
    }).catch((err) => {
      console.error('⚠️  Admin email failed (message still saved):', err.message);
    });

    // 3. Auto-reply to submitter (fire-and-forget)
    transporter.sendMail({
      from   : `"Pawan Mahesh" <${process.env.SMTP_USER}>`,
      to     : email,
      subject: `Thanks for reaching out, ${name}! 👋`,
      html   : `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#08080f;font-family:'Inter',Helvetica,Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;background:#13131f;border-radius:16px;overflow:hidden;border:1px solid rgba(99,102,241,0.2);">

            <!-- Header -->
            <div style="background:linear-gradient(135deg,#6366f1 0%,#22d3ee 100%);padding:32px 40px;">
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.02em;">
                Thanks for reaching out! 🚀
              </h1>
            </div>

            <!-- Body -->
            <div style="padding:32px 40px;">
              <p style="color:#94a3b8;font-size:16px;line-height:1.7;margin:0 0 16px;">
                Hi <strong style="color:#f1f5f9;">${name}</strong>,
              </p>
              <p style="color:#94a3b8;font-size:16px;line-height:1.7;margin:0 0 16px;">
                I've received your message and will get back to you <strong style="color:#f1f5f9;">within 24 hours</strong>. 
                I appreciate you taking the time to write!
              </p>

              <!-- Message preview -->
              <div style="background:#0f0f1a;border-left:3px solid #6366f1;border-radius:8px;padding:16px 20px;margin:24px 0;">
                <p style="color:#6366f1;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px;">Your message</p>
                <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;">${message.substring(0,300)}${message.length > 300 ? '…' : ''}</p>
              </div>

              <p style="color:#94a3b8;font-size:16px;line-height:1.7;margin:0 0 16px;">
                In the meantime, feel free to connect with me on social media or check out my portfolio.
              </p>
              <p style="color:#94a3b8;font-size:16px;line-height:1.7;margin:0;">
                Best regards,<br/>
                <strong style="color:#f1f5f9;">Pawan Mahesh</strong>
              </p>
            </div>

            <!-- Footer -->
            <div style="padding:20px 40px;border-top:1px solid rgba(99,102,241,0.15);">
              <p style="color:#475569;font-size:12px;margin:0;text-align:center;">
                This is an automated reply. Please don't respond to this email directly.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    }).catch((err) => {
      console.error('⚠️  Auto-reply failed:', err.message);
    });

    res.status(201).json({ message: 'Message sent successfully! I will get back to you soon.' });
  } catch (err) {
    next(err);
  }
});


// ─── GET /api/contact/messages  (admin) ───────────────────────
router.get('/messages', protect, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM contact_messages ORDER BY sent_at DESC'
    );
    const unread = rows.filter(r => !r.is_read).length;
    res.json({ messages: rows, unread_count: unread });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/contact/messages/:id/read  (admin) ────────────
router.patch('/messages/:id/read', protect, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'UPDATE contact_messages SET is_read = TRUE WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Message not found.' });
    res.json({ message: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/contact/messages/:id  (admin) ────────────────
router.delete('/messages/:id', protect, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM contact_messages WHERE id = $1', [req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Message not found.' });
    res.json({ message: 'Message deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
