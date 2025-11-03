const express = require("express");
const router = express.Router();
const adminPurchaseCtrl = require("../controllers/adminPurchase.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { verifyJwtMiddleware } = require("../middlewares/dashboardJwt");
const isAdmin = require("../middlewares/isAdmin");

/**
 * @swagger
 * tags:
 *   name: AdminPurchases
 *   description: Admin management of user purchases
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Purchase:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         package_id:
 *           type: integer
 *         start_date:
 *           type: string
 *           format: date-time
 *         end_date:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           example: active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Package:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         duration_days:
 *           type: integer
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 */

/**
 * @swagger
 * /api/admin/purchases:
 *   get:
 *     summary: Get all purchases
 *     tags: [AdminPurchases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all purchases
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Purchase'
 */
router.get("/", verifyJwtMiddleware, isAdmin, asyncHandler(adminPurchaseCtrl.getAllPurchases));

/**
 * @swagger
 * /api/admin/purchases/{id}:
 *   get:
 *     summary: Get single purchase by ID
 *     tags: [AdminPurchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Purchase ID
 *     responses:
 *       200:
 *         description: Purchase details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Purchase'
 *       404:
 *         description: Purchase not found
 */
router.get("/:id", verifyJwtMiddleware, isAdmin, asyncHandler(adminPurchaseCtrl.getPurchaseById));

/**
 * @swagger
 * /api/admin/purchases/user/{userId}:
 *   get:
 *     summary: Get all purchases by a specific user
 *     tags: [AdminPurchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of purchases for the specified user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Purchase'
 *       404:
 *         description: No purchases found for this user
 */
router.get("/user/:userId", verifyJwtMiddleware, isAdmin, asyncHandler(adminPurchaseCtrl.getPurchasesByUserId));

/**
 * @swagger
 * /api/admin/purchases/{id}:
 *   delete:
 *     summary: Delete a purchase
 *     tags: [AdminPurchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Purchase ID
 *     responses:
 *       200:
 *         description: Purchase deleted successfully
 *       404:
 *         description: Purchase not found
 */
router.delete("/:id", verifyJwtMiddleware, isAdmin, asyncHandler(adminPurchaseCtrl.deletePurchase));

/**
 * @swagger
 * /api/admin/purchases/{id}/status:
 *   patch:
 *     summary: Change purchase status
 *     tags: [AdminPurchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Purchase ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: expired
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Purchase not found
 */
router.patch("/:id/status", verifyJwtMiddleware, isAdmin, asyncHandler(adminPurchaseCtrl.updatePurchaseStatus));

module.exports = router;
