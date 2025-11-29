const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/auth.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { verifyJwtMiddleware } = require("../middlewares/dashboardJwt");
const { validate } = require("../middlewares/validate");
const { registerValidator, loginValidator } = require("../validator/auth.validator");
const upload = require("../middlewares/upload");
const isCustomer = require("../middlewares/isCustomer");

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
    upload.none(), // ✅ allows form-data
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
    upload.none(), // ✅ allows form-data
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


router.get("/customer/profile",verifyJwtMiddleware,isCustomer,asyncHandler(authCtrl.getCustomerProfile))
router.put("/customer/profile/update", verifyJwtMiddleware,isCustomer, upload.single("profile_image"), authCtrl.updateCustomerProfile);


module.exports = router;
