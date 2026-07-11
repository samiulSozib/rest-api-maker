const crypto = require('crypto');
const { User, TokenLog, Session, AuthLog } = require('../models');
const { hashPassword, comparePassword } = require('../services/password.service');
const sendEmail = require('../services/email.service');
const {
  genApiToken, hashToken,
  genAccessToken, genRefreshToken, hashRefreshToken,
  parseDurationToSeconds, TOKEN_EXPIRES_IN, REFRESH_EXPIRES_DAYS,
} = require('../services/token.service');
const asyncHandler = require('../middlewares/asyncHandler');

const REFRESH_EXPIRES_SECONDS = REFRESH_EXPIRES_DAYS * 86400;
const REQUIRE_EMAIL_VERIFICATION = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
const VERIFY_TOKEN_EXPIRY_HOURS = Number(process.env.VERIFY_TOKEN_EXPIRY_HOURS) || 24;
const VERIFY_TOKEN_EXPIRY_MS = VERIFY_TOKEN_EXPIRY_HOURS * 3600 * 1000;
const COOKIE_SECURE = process.env.NODE_ENV === 'production';
const COOKIE_SAME_SITE = 'strict';

function setRefreshCookie(res, rawRefreshToken) {
  res.cookie('refresh_token', rawRefreshToken, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: '/api/auth',
    maxAge: REFRESH_EXPIRES_SECONDS * 1000,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: '/api/auth',
  });
}

function buildAuthResponse(user, accessToken, expiresIn, rawRefreshToken) {
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    access_token: accessToken,
    refresh_token: rawRefreshToken,
    token: accessToken,
    token_type: 'Bearer',
    expires_in: expiresIn,
    refresh_expires_in: REFRESH_EXPIRES_SECONDS,
  };
}

async function createSession(userId, refreshTokenHash, expiresAt, req) {
  return Session.create({
    user_id: userId,
    refresh_token_hash: refreshTokenHash,
    expires_at: expiresAt,
    user_agent: req?.headers?.['user-agent'] || null,
    ip_address: req?.ip || req?.connection?.remoteAddress || null,
  });
}

function extractRefreshToken(req) {
  return req.cookies?.refresh_token || req.body?.refresh_token;
}

async function revokeAllUserSessions(userId) {
  await Session.destroy({ where: { user_id: userId } });
}

function getClientIp(req) {
  return req?.ip || req?.connection?.remoteAddress || null;
}

function getUserAgent(req) {
  return req?.headers?.['user-agent'] || null;
}

async function logAuthEvent(event, userId, req, details) {
  try {
    await AuthLog.create({
      user_id: userId,
      event,
      ip_address: getClientIp(req),
      user_agent: getUserAgent(req),
      details: details ? JSON.stringify(details) : null,
    });
  } catch (err) {
    // logging should never break the main flow
  }
}

async function sendVerificationEmail(user, req) {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + VERIFY_TOKEN_EXPIRY_MS);

  await user.update({
    email_verify_token: hashedToken,
    email_verify_expires: expiresAt,
  });

  const verifyLink = `${process.env.FRONTEND_URL || ''}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;

  try {
    await sendEmail({
      to: user.email,
      template: 'verifyEmail',
      data: {
        name: user.name,
        verifyLink,
        expiryTime: `${VERIFY_TOKEN_EXPIRY_HOURS} hour(s)`,
      },
    });
    await logAuthEvent('verification_sent', user.id, req);
  } catch (emailError) {
    // email failure shouldn't block registration
  }
}

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
  const email_verified = !REQUIRE_EMAIL_VERIFICATION;
  const user = await User.create({ name, email, password: hashed, email_verified });

  await logAuthEvent('register', user.id, req);

  if (!email_verified) {
    await sendVerificationEmail(user, req);
    return res.status(201).json({
      status: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    });
  }

  const { token: accessToken, expiresIn } = genAccessToken(user);
  const rawRefreshToken = genRefreshToken();
  const refreshTokenHash = hashRefreshToken(rawRefreshToken);
  const refreshExpiry = new Date(Date.now() + REFRESH_EXPIRES_SECONDS * 1000);

  await createSession(user.id, refreshTokenHash, refreshExpiry, req);

  setRefreshCookie(res, rawRefreshToken);

  return res.status(201).json({
    status: true,
    message: 'User registered successfully',
    data: buildAuthResponse(user, accessToken, expiresIn, rawRefreshToken),
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
    await logAuthEvent('login_failed', null, req, { email, reason: 'user_not_found' });
    return res.status(401).json({
      status: false,
      message: 'Invalid credentials',
      data: null,
    });
  }

  if (REQUIRE_EMAIL_VERIFICATION && !user.email_verified) {
    await logAuthEvent('login_failed', user.id, req, { reason: 'email_not_verified' });
    return res.status(403).json({
      status: false,
      message: 'Please verify your email before logging in.',
      data: null,
    });
  }

  if (!user.is_active) {
    await logAuthEvent('login_failed', user.id, req, { reason: 'account_deactivated' });
    return res.status(403).json({
      status: false,
      message: 'Account is deactivated. Contact support.',
      data: null,
    });
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const remaining = Math.ceil((new Date(user.locked_until) - new Date()) / 1000 / 60);
    await logAuthEvent('login_failed', user.id, req, { reason: 'account_locked' });
    return res.status(423).json({
      status: false,
      message: `Account is locked. Try again in ${remaining} minute(s).`,
      data: null,
    });
  }

  const ok = await comparePassword(password, user.password);
  if (!ok) {
    const attempts = (user.failed_login_attempts || 0) + 1;
    const MAX_ATTEMPTS = 5;
    if (attempts >= MAX_ATTEMPTS) {
      await user.update({
        failed_login_attempts: attempts,
        locked_until: new Date(Date.now() + 15 * 60 * 1000),
      });
      await logAuthEvent('login_failed', user.id, req, { reason: 'account_locked_too_many_attempts' });
      return res.status(423).json({
        status: false,
        message: 'Account locked due to too many failed attempts. Try again in 15 minutes.',
        data: null,
      });
    }
    await user.update({ failed_login_attempts: attempts });
    await logAuthEvent('login_failed', user.id, req, { reason: 'invalid_password' });
    return res.status(401).json({
      status: false,
      message: 'Invalid credentials',
      data: null,
    });
  }

  const { token: accessToken, expiresIn } = genAccessToken(user);
  const rawRefreshToken = genRefreshToken();
  const refreshTokenHash = hashRefreshToken(rawRefreshToken);
  const refreshExpiry = new Date(Date.now() + REFRESH_EXPIRES_SECONDS * 1000);

  await user.update({
    failed_login_attempts: 0,
    locked_until: null,
    last_login: new Date(),
  });

  await createSession(user.id, refreshTokenHash, refreshExpiry, req);

  setRefreshCookie(res, rawRefreshToken);

  await logAuthEvent('login_success', user.id, req);

  return res.status(200).json({
    status: true,
    message: 'Login successful',
    data: buildAuthResponse(user, accessToken, expiresIn, rawRefreshToken),
  });
});

// REFRESH TOKEN
exports.refreshToken = asyncHandler(async (req, res) => {
  const refresh_token = extractRefreshToken(req);

  if (!refresh_token) {
    return res.status(400).json({
      status: false,
      message: 'refresh_token is required (cookie or body)',
      data: null,
    });
  }

  const refreshTokenHash = hashRefreshToken(refresh_token);

  const session = await Session.findOne({ where: { refresh_token_hash: refreshTokenHash } });
  if (!session) {
    return res.status(401).json({
      status: false,
      message: 'Invalid refresh token',
      data: null,
    });
  }

  if (new Date(session.expires_at) < new Date()) {
    await Session.destroy({ where: { id: session.id } });
    return res.status(401).json({
      status: false,
      message: 'Refresh token expired. Please login again.',
      data: null,
    });
  }

  // Reuse detection: if this session was already rotated, flag it as token theft
  if (session.replaced_at) {
    const user = await User.findByPk(session.user_id);
    if (user) {
      await user.increment('token_version');
    }
    await revokeAllUserSessions(session.user_id);
    await logAuthEvent('refresh_reuse_detected', session.user_id, req);
    return res.status(401).json({
      status: false,
      message: 'Refresh token reuse detected. All sessions have been revoked. Please login again.',
      data: null,
    });
  }

  const user = await User.findByPk(session.user_id);
  if (!user || !user.is_active) {
    await Session.destroy({ where: { id: session.id } });
    return res.status(401).json({
      status: false,
      message: 'Account not found or deactivated.',
      data: null,
    });
  }

  // Rotate: mark old session as replaced, create new one
  await session.update({ replaced_at: new Date() });

  const { token: newAccessToken, expiresIn } = genAccessToken(user);
  const newRawRefreshToken = genRefreshToken();
  const newRefreshTokenHash = hashRefreshToken(newRawRefreshToken);
  const newRefreshExpiry = new Date(Date.now() + REFRESH_EXPIRES_SECONDS * 1000);

  await createSession(user.id, newRefreshTokenHash, newRefreshExpiry, req);

  setRefreshCookie(res, newRawRefreshToken);

  await logAuthEvent('refresh', user.id, req);

  return res.status(200).json({
    status: true,
    message: 'Tokens refreshed successfully',
    data: {
      access_token: newAccessToken,
      refresh_token: newRawRefreshToken,
      token: newAccessToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      refresh_expires_in: REFRESH_EXPIRES_SECONDS,
    },
  });
});

// VERIFY EMAIL
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token, email } = req.body;

  if (!token || !email) {
    return res.status(400).json({
      status: false,
      message: 'Token and email are required',
      data: null,
    });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    where: {
      email,
      email_verify_token: hashedToken,
      email_verify_expires: { [require('sequelize').Op.gt]: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({
      status: false,
      message: 'Invalid or expired verification token',
      data: null,
    });
  }

  await user.update({
    email_verified: true,
    email_verify_token: null,
    email_verify_expires: null,
  });

  await logAuthEvent('email_verified', user.id, req);

  return res.status(200).json({
    status: true,
    message: 'Email verified successfully. You can now login.',
    data: null,
  });
});

// RESEND VERIFICATION EMAIL
exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: false,
      message: 'Email is required',
      data: null,
    });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(200).json({
      status: true,
      message: 'If the email exists, a verification link has been sent.',
      data: null,
    });
  }

  if (user.email_verified) {
    return res.status(200).json({
      status: true,
      message: 'Email is already verified.',
      data: null,
    });
  }

  await sendVerificationEmail(user, req);

  return res.status(200).json({
    status: true,
    message: 'Verification email sent successfully.',
    data: null,
  });
});

// LOGOUT (revoke refresh token)
exports.logout = asyncHandler(async (req, res) => {
  const refresh_token = extractRefreshToken(req);

  if (refresh_token) {
    const refreshTokenHash = hashRefreshToken(refresh_token);
    await Session.destroy({ where: { refresh_token_hash: refreshTokenHash, user_id: req.user.id } });
  } else {
    await revokeAllUserSessions(req.user.id);
  }

  clearRefreshCookie(res);

  await logAuthEvent('logout', req.user.id, req);

  return res.status(200).json({
    status: true,
    message: 'Logged out successfully',
    data: null,
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






