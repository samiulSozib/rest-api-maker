const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const authCtrl = require("../controllers/auth.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { verifyJwtMiddleware } = require("../middlewares/dashboardJwt");
const { validate } = require("../middlewares/validate");
const { registerValidator, loginValidator } = require("../validator/auth.validator");
const upload = require("../middlewares/upload");

// Auth-specific rate limiters
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { status: false, message: "Too many login attempts. Try again later.", data: null },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { status: false, message: "Too many registration attempts. Try again later.", data: null },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { status: false, message: "Too many requests. Try again later.", data: null },
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Core authentication and token management APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Samiul Bashar
 *               email:
 *                 type: string
 *                 example: samiul@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       400:
 *         description: Validation or registration error
 */
router.post(
    "/register",
    registerLimiter,
    upload.none(),
    registerValidator,
    validate,
    asyncHandler(authCtrl.register)
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and get a JWT token
 *     tags: [Auth]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: samiul@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Samiul Bashar
 *                     email:
 *                       type: string
 *                       example: samiul@example.com
 *       401:
 *         description: Invalid credentials
 */
router.post(
    "/login",
    loginLimiter,
    upload.none(),
    loginValidator,
    validate,
    asyncHandler(authCtrl.login)
);

/**
 * @swagger
 * /api/auth/token/generate:
 *   post:
 *     summary: Generate a new API access token (for REST API usage)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiToken:
 *                   type: string
 *                   example: 9f3b2f4d1c4aef4a9a5c12ab8f6e0a77
 *                 expiresAt:
 *                   type: string
 *                   example: 2025-12-31T23:59:59Z
 *       401:
 *         description: Unauthorized or invalid JWT
 */
router.post(
    "/token/generate",
    verifyJwtMiddleware,
    asyncHandler(authCtrl.generateApiToken)
);

/**
 * @swagger
 * /api/auth/token/revoke:
 *   post:
 *     summary: Revoke an existing API token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: API token revoked successfully
 *       401:
 *         description: Unauthorized or invalid JWT
 */
router.post(
    "/token/revoke",
    verifyJwtMiddleware,
    asyncHandler(authCtrl.revokeApiToken)
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using a valid refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
    "/refresh",
    asyncHandler(authCtrl.refreshToken)
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and revoke refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/logout",
    verifyJwtMiddleware,
    asyncHandler(authCtrl.logout)
);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email address with token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - email
 *             properties:
 *               token:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post(
    "/verify-email",
    asyncHandler(authCtrl.verifyEmail)
);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend email verification link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification email sent
 */
router.post(
    "/resend-verification",
    registerLimiter,
    asyncHandler(authCtrl.resendVerification)
);

module.exports = router;
