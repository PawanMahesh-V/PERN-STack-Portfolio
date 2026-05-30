// server/middleware/rateLimiter.js
// Protects login + contact endpoints from brute-force / spam attacks.

const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

/** Strict limiter for login — 10 attempts in prod, effectively unlimited in dev */
const loginLimiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  max      : isDev ? 10_000 : 10,          // dev: don't block yourself
  skip     : () => isDev,                  // skip entirely in dev mode
  message  : { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders  : false,
});

/**
 * General API limiter
 *  - Dev:  completely disabled (React StrictMode + HMR = rapid requests)
 *  - Prod: 300 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  max      : 300,
  skip     : () => isDev,                  // ← key fix: no 429s in development
  message  : { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders  : false,
});

/** Contact form — 5 submissions per hour in prod, 100 in dev */
const contactLimiter = rateLimit({
  windowMs : 60 * 60 * 1000,
  max      : isDev ? 100 : 5,
  skip     : () => isDev,
  message  : { error: 'Too many contact form submissions. Please wait an hour.' },
  standardHeaders: true,
  legacyHeaders  : false,
});

module.exports = { loginLimiter, apiLimiter, contactLimiter };
