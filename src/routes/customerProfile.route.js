const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const profileCtrl = require("../controllers/customerProfile.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { verifyJwtMiddleware } = require("../middlewares/dashboardJwt");
const upload = require("../middlewares/upload");
const isCustomer = require("../middlewares/isCustomer");

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { status: false, message: "Too many requests. Try again later.", data: null },
});

/**
 * @swagger
 * tags:
 *   name: Customer Profile
 *   description: Customer profile management APIs
 */

/**
 * @swagger
 * /api/customer/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Customer Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *                     phone_number:
 *                       type: string
 *                       example: "+1234567890"
 *                     address:
 *                       type: string
 *                       example: 123 Main St
 *                     city:
 *                       type: string
 *                       example: New York
 *                     state:
 *                       type: string
 *                       example: NY
 *                     country:
 *                       type: string
 *                       example: USA
 *                     profile_image:
 *                       type: string
 *                       example: "/uploads/profile/profile_xxx.jpg"
 *                     role:
 *                       type: string
 *                       example: user
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get(
  "/profile",
  verifyJwtMiddleware,
  isCustomer,
  asyncHandler(profileCtrl.getUserProfile)
);

/**
 * @swagger
 * /api/customer/profile/update:
 *   put:
 *     summary: Update user profile
 *     tags: [Customer Profile]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe Updated
 *               phone_number:
 *                 type: string
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 example: 456 Oak Ave
 *               city:
 *                 type: string
 *                 example: Los Angeles
 *               state:
 *                 type: string
 *                 example: CA
 *               country:
 *                 type: string
 *                 example: USA
 *               profile_image:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (JPEG, PNG, etc.)
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     address:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     country:
 *                       type: string
 *                     profile_image:
 *                       type: string
 *       400:
 *         description: Invalid input or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put(
  "/profile/update",
  verifyJwtMiddleware,
  isCustomer,
  upload.single("profile_image"),
  asyncHandler(profileCtrl.updateUserProfile)
);


/**
 * @swagger
 * /api/customer/profile/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Customer Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 example: OldPassword123
 *               new_password:
 *                 type: string
 *                 example: NewStrongPassword456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         description: Invalid input or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post(
  "/profile/change-password",
  verifyJwtMiddleware,
  isCustomer,
  asyncHandler(profileCtrl.changePassword)
);

/**
 * @swagger
 * /api/customer/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Customer Profile]
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
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset link sent to email
 */
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  asyncHandler(profileCtrl.forgotPassword)
);

/**
 * @swagger
 * /api/customer/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Customer Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - new_password
 *               - confirm_password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: reset-token-from-email
 *               new_password:
 *                 type: string
 *                 example: NewStrongPassword456
 *               confirm_password:
 *                 type: string
 *                 example: NewStrongPassword456
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post(
  "/reset-password",
  asyncHandler(profileCtrl.resetPassword)
);

/**
 * @swagger
 * /api/customer/verify-reset-token:
 *   post:
 *     summary: Verify reset token validity
 *     tags: [Customer Profile]
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
 *         description: Token is valid
 */
router.post(
  "/verify-reset-token",
  asyncHandler(profileCtrl.verifyResetToken)
);
module.exports = router;
