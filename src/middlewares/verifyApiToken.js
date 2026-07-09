const { User, Purchase } = require('../models');
const { hashToken } = require('../services/token.service');

module.exports = async function verifyApiToken(req, res, next) {
  const auth = req.headers['x-api-key'] || req.headers['authorization'];
  if (!auth) {
    return res.status(401).json({ status: false, message: 'Missing API token. Provide via x-api-key header.' });
  }

  let token = auth;
  if (auth.startsWith('Bearer ')) {
    token = auth.slice(7).trim();
  }

  const tokenHash = hashToken(token);

  const user = await User.findOne({ where: { api_token_hash: tokenHash } });
  if (!user) {
    return res.status(403).json({ status: false, message: 'Invalid API token' });
  }

  if (!user.token_expiry || new Date(user.token_expiry) < new Date()) {
    return res.status(403).json({ status: false, message: 'API token expired' });
  }

  const activePurchase = await Purchase.findOne({
    where: { user_id: user.id, status: 'active' },
  });
  if (!activePurchase) {
    return res.status(403).json({ status: false, message: 'No active purchase. Please renew your plan.' });
  }

  req.auth = { userId: user.id, user };
  next();
};
