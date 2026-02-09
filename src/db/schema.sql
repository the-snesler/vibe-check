CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  google_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  picture_url TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL UNIQUE,
  overland_token TEXT NOT NULL UNIQUE,
  discord_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
CREATE INDEX IF NOT EXISTS idx_users_overland_token ON users(overland_token);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
