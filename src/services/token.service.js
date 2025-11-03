const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const TOKEN_ALGO = process.env.API_TOKEN_HASH_ALGO || 'sha256';

function genApiToken() {
  // returns raw token to send to user (store only hash)
  return crypto.randomBytes(48).toString('hex');
}

function hashToken(token) {
  return crypto.createHash(TOKEN_ALGO).update(token).digest('hex');
}

function genJwt(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
}

function verifyJwt(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { genApiToken, hashToken, genJwt, verifyJwt };
