const { verifyAccessToken } = require('../services/token.service');
const { User } = require('../models');

module.exports.verifyJwtMiddleware = async (req, res, next) => {
  let token = null;
  const auth = req.headers['authorization'];

  // Check Authorization header first, then fall back to cookie
  if (auth && auth.startsWith('Bearer ')) {
    token = auth.slice(7);
  } else if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({ status: false, message: 'Missing access token', data: null });
  }
  try {
    const payload = verifyAccessToken(token);

    if (payload.token_version == null) {
      return res
        .status(401)
        .json({
          status: false,
          message: 'Token issued by old system. Please login again.',
          data: null,
        });
    }

    const user = await User.findByPk(payload.id, { attributes: ['token_version'] });
    if (!user) {
      return res.status(401).json({ status: false, message: 'User no longer exists', data: null });
    }
    if (user.token_version !== payload.token_version) {
      return res
        .status(401)
        .json({ status: false, message: 'Token invalidated. Please login again.', data: null });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ status: false, message: 'Invalid or expired access token', data: null });
  }
};
