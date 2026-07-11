const { verifyAccessToken } = require('../services/token.service');
const { User } = require('../models');

module.exports.verifyJwtMiddleware = async (req, res, next) => {
  const auth = req.headers['authorization'];
  if(!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ status: false, message: 'Missing access token', data: null });
  const token = auth.slice(7);
  try {
    const payload = verifyAccessToken(token);

    if (payload.token_version == null) {
      return res.status(401).json({ status: false, message: 'Token issued by old system. Please login again.', data: null });
    }

    const user = await User.findByPk(payload.id, { attributes: ['token_version'] });
    if (!user) {
      return res.status(401).json({ status: false, message: 'User no longer exists', data: null });
    }
    if (user.token_version !== payload.token_version) {
      return res.status(401).json({ status: false, message: 'Token invalidated. Please login again.', data: null });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ status: false, message: 'Invalid or expired access token', data: null });
  }
};
