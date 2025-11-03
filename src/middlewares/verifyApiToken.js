const { User, Payment } = require('../models');
const { hashToken } = require('../services/token.service');

module.exports = async function verifyApiToken(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing API token' });
  const token = auth.slice(7).trim();
  const tokenHash = hashToken(token);

  const user = await User.findOne({ where: { api_token_hash: tokenHash } });
  if (!user) return res.status(403).json({ error: 'Invalid API token' });

  if (!user.token_expiry || new Date(user.token_expiry) < new Date()) {
    return res.status(403).json({ error: 'API token expired' });
  }

  // Optionally verify most recent completed payment exists and not expired
  const recentPayment = await Payment.findOne({
    where: { user_id: user.id, status: 'completed' },
    order: [['created_at', 'DESC']]
  });
  if (!recentPayment) return res.status(403).json({ error: 'No active package' });

  req.auth = { userId: user.id, user };
  next();
};
