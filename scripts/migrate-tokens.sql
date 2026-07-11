-- Migration: Add token_version to users, create sessions table
-- Run this against your existing database if you have data you want to preserve

ALTER TABLE users
  ADD COLUMN token_version INT NOT NULL DEFAULT 0 AFTER `role`,
  DROP COLUMN IF EXISTS refresh_token_hash,
  DROP COLUMN IF EXISTS refresh_token_expiry;

CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  refresh_token_hash VARCHAR(128) NOT NULL,
  expires_at DATETIME NOT NULL,
  replaced_at DATETIME DEFAULT NULL COMMENT 'Set when token is rotated; used for reuse detection',
  user_agent VARCHAR(500) DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_refresh_token_hash (refresh_token_hash),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auth_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) DEFAULT NULL,
  event VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  details TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_auth_logs_user_id (user_id),
  INDEX idx_auth_logs_event (event),
  INDEX idx_auth_logs_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- This project uses sequelize.sync({ alter: true }) in dev, which auto-adds columns.
-- For production, run the ALTER TABLE and CREATE TABLE statements above manually.
