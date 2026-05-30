-- ============================================================
-- PERN Portfolio — PostgreSQL Schema (Neon DB)
-- Run via: node db/init.js
-- ============================================================

-- ─── Users (Admin only) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255)        NOT NULL,   -- bcrypt hash
  created_at  TIMESTAMPTZ         DEFAULT NOW()
);

-- ─── File Assets (Compressed binary — stored in Neon BYTEA) ──
CREATE TABLE IF NOT EXISTS file_assets (
  id          SERIAL PRIMARY KEY,
  asset_key   VARCHAR(100) UNIQUE NOT NULL,   -- 'avatar' | 'cv'
  filename    VARCHAR(255),
  mime_type   VARCHAR(100),
  file_data   BYTEA               NOT NULL,   -- Sharp WebP / raw PDF
  file_size   INT,                            -- bytes after compression
  created_at  TIMESTAMPTZ         DEFAULT NOW(),
  updated_at  TIMESTAMPTZ         DEFAULT NOW()
);

-- ─── Global Settings (key/value pairs) ───────────────────────
CREATE TABLE IF NOT EXISTS global_settings (
  key         VARCHAR(100) PRIMARY KEY,       -- 'hero_title' | 'hero_subtitle' | 'about_text' | 'avatar_key' | 'cv_key'
  value       TEXT
);

-- ─── Sections (dynamic section registry) ─────────────────────
CREATE TABLE IF NOT EXISTS sections (
  id            SERIAL PRIMARY KEY,
  type          VARCHAR(50)   NOT NULL        -- 'about'|'experience'|'projects'|'certificates'|'skills'|'contact'
                  CHECK (type IN ('about','experience','projects','certificates','skills','contact')),
  title         VARCHAR(255)  NOT NULL,
  display_order INT           NOT NULL DEFAULT 0,
  is_visible    BOOLEAN                DEFAULT TRUE,
  created_at    TIMESTAMPTZ            DEFAULT NOW()
);

-- ─── Certificates ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id            SERIAL PRIMARY KEY,
  section_id    INT REFERENCES sections(id) ON DELETE CASCADE,
  title         VARCHAR(255)  NOT NULL,
  issuer        VARCHAR(255),
  image_url     TEXT,                         -- URL or '/api/assets/cert-{id}'
  issue_date    DATE,
  cert_url      TEXT,                         -- link to credential
  display_order INT           DEFAULT 0
);

-- ─── Projects ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id            SERIAL PRIMARY KEY,
  section_id    INT REFERENCES sections(id) ON DELETE CASCADE,
  title         VARCHAR(255)  NOT NULL,
  description   TEXT,
  tech_stack    TEXT[]        DEFAULT '{}',   -- PostgreSQL array
  github_url    TEXT,
  live_url      TEXT,                         -- optional
  image_url     TEXT,
  display_order INT           DEFAULT 0
);

-- ─── Experiences ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experiences (
  id            SERIAL PRIMARY KEY,
  section_id    INT REFERENCES sections(id) ON DELETE CASCADE,
  company       VARCHAR(255)  NOT NULL,
  role          VARCHAR(255)  NOT NULL,
  start_date    DATE,
  end_date      DATE,                         -- NULL = "Present"
  bullets       TEXT[]        DEFAULT '{}',   -- array of bullet strings
  logo_url      TEXT,
  display_order INT           DEFAULT 0
);

-- ─── Contact Messages (inbox) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(255)  NOT NULL,
  email     VARCHAR(255)  NOT NULL,
  message   TEXT          NOT NULL,
  is_read   BOOLEAN       DEFAULT FALSE,
  sent_at   TIMESTAMPTZ   DEFAULT NOW()
);

-- ─── Default global settings ──────────────────────────────────
INSERT INTO global_settings (key, value) VALUES
  ('hero_title',    'Hi, I''m Your Name')
ON CONFLICT (key) DO NOTHING;

INSERT INTO global_settings (key, value) VALUES
  ('hero_subtitle', 'Full-Stack Developer & Problem Solver')
ON CONFLICT (key) DO NOTHING;

INSERT INTO global_settings (key, value) VALUES
  ('about_text',    'Write something about yourself here.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO global_settings (key, value) VALUES
  ('avatar_key',    '')
ON CONFLICT (key) DO NOTHING;

INSERT INTO global_settings (key, value) VALUES
  ('cv_key',        '')
ON CONFLICT (key) DO NOTHING;
