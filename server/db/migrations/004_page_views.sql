-- Add page_views table for analytics
CREATE TABLE IF NOT EXISTS page_views (
  id         BIGSERIAL PRIMARY KEY,
  path       TEXT NOT NULL DEFAULT '/',
  user_agent TEXT,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast time-based queries
CREATE INDEX IF NOT EXISTS idx_page_views_visited_at ON page_views (visited_at);
