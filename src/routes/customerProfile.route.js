const express = require("express");
const router = express.Router();
const profileCtrl = require("../controllers/customerProfile.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { verifyJwtMiddleware } = require("../middlewares/dashboardJwt");
const upload = require("../middlewares/upload");
const isCustomer = require("../middlewares/isCustomer");

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

module.exports = router;
