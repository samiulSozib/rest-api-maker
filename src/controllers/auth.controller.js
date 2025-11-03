const { User, Package, TokenLog } = require('../models');
const { hashPassword, comparePassword } = require('../services/password.service');
const { genApiToken, hashToken, genJwt } = require('../services/token.service');
const { Op } = require('sequelize');
const asyncHandler = require('../middlewares/asyncHandler');

// REGISTER
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      status: false,
      message: 'Missing required fields (name, email, password)',
      data: null,
    });
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) {
    return res.status(409).json({
      status: false,
      message: 'Email already registered',
      data: null,
    });
  }

  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, password: hashed });

  const token = genJwt({ id: user.id, email: user.email, role: user.role });

  return res.status(201).json({
    status: true,
    message: 'User registered successfully',
    data: {
      user: { id: user.id, name: user.name, email: user.email,role:user.role },
      token,
    },
  });
});

// LOGIN
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: false,
      message: 'Missing required fields (email, password)',
      data: null,
    });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({
      status: false,
      message: 'Invalid credentials',
      data: null,
    });
  }

  const ok = await comparePassword(password, user.password);
  if (!ok) {
    return res.status(401).json({
      status: false,
      message: 'Invalid credentials',
      data: null,
    });
  }

  const token = genJwt({ id: user.id, email: user.email, role: user.role });

  return res.status(200).json({
    status: true,
    message: 'Login successful',
    data: {
      user: { id: user.id, name: user.name, email: user.email,role:user.role },
      token,
    },
  });
});

// GENERATE API TOKEN
exports.generateApiToken = asyncHandler(async (req, res) => {
  const userId = req.user.id; // requires JWT middleware
  const rawToken = genApiToken();
  const tokenHash = hashToken(rawToken);

  const expiresDays = Number(process.env.API_TOKEN_EXPIRES_DAYS) || 30;
  const expiry = new Date(Date.now() + expiresDays * 24 * 3600 * 1000);

  await User.update({ api_token_hash: tokenHash, token_expiry: expiry }, { where: { id: userId } });
  await TokenLog.create({ user_id: userId, api_token_hash: tokenHash, action: 'created' });

  return res.status(200).json({
    status: true,
    message: 'API token generated successfully',
    data: {
      api_token: rawToken,
      token_expiry: expiry,
    },
  });
});

// REVOKE API TOKEN
exports.revokeApiToken = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findByPk(userId);

  if (!user || !user.api_token_hash) {
    return res.status(400).json({
      status: false,
      message: 'No active token found to revoke',
      data: null,
    });
  }

  await TokenLog.create({ user_id: userId, api_token_hash: user.api_token_hash, action: 'revoked' });
  await User.update({ api_token_hash: null, token_expiry: null }, { where: { id: userId } });

  return res.status(200).json({
    status: true,
    message: 'API token revoked successfully',
    data: null,
  });
});
