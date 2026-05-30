// server/middleware/errorHandler.js
// Centralised error handler — must be the LAST middleware registered.

const errorHandler = (err, req, res, next) => {
  // Log full error in development only
  if (process.env.NODE_ENV !== 'production') {
    console.error('🔴 Error:', err);
  }

  // Multer file-size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Check the size limits.' });
  }

  // PostgreSQL unique-violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry — this record already exists.' });
  }

  // PostgreSQL FK violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record does not exist.' });
  }

  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error.';

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
