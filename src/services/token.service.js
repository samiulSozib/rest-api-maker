const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const TOKEN_ALGO = process.env.API_TOKEN_HASH_ALGO || 'sha256';

const TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7;

function genApiToken() {
  return crypto.randomBytes(48).toString('hex');
}

function hashToken(token) {
  return crypto.createHash(TOKEN_ALGO).update(token).digest('hex');
}

function parseDurationToSeconds(duration) {
  const match = String(duration).match(/^(\d+)\s*(s|m|h|d)$/);
  if (!match) return 900;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return val * (multipliers[unit] || 60);
}

function genAccessToken(user) {
  const expiresInSeconds = parseDurationToSeconds(TOKEN_EXPIRES_IN);
  const payload = {
    jti: crypto.randomBytes(16).toString('hex'),
    id: user.id,
    email: user.email,
    role: user.role,
    token_version: user.token_version,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
  return { token, expiresIn: expiresInSeconds };
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function genRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

function hashRefreshToken(token) {
  return crypto.createHash(TOKEN_ALGO).update(token).digest('hex');
}

module.exports = {
  genApiToken, hashToken,
  genAccessToken, verifyAccessToken,
  genRefreshToken, hashRefreshToken,
  parseDurationToSeconds, TOKEN_EXPIRES_IN, REFRESH_EXPIRES_DAYS,
};
