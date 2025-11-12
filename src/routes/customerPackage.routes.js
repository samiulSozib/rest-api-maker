const express = require("express");
const router = express.Router();
const customerCtrl = require("../controllers/customerPackage.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { verifyJwtMiddleware } = require("../middlewares/dashboardJwt");
const isCustomer = require("../middlewares/isCustomer");
const upload = require("../middlewares/upload");

/**
 * @swagger
 * tags:
 *   name: CustomerPackages
 *   description: Customer package browsing and purchase
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CustomerPackage:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Professional Plan
 *         base_price:
 *           type: number
 *           format: float
 *           example: 49.99
 *         max_projects:
 *           type: integer
 *           example: 10
 *         max_tables_per_project:
 *           type: integer
 *           example: 50
 *         features:
 *           type: object
 *           properties:
 *             priority_support:
 *               type: boolean
 *               example: true
 *             advanced_analytics:
 *               type: boolean
 *               example: true
 *         plans:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PackagePlan'
 * 
 *     Purchase:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 5
 *         package:
 *           $ref: '#/components/schemas/Package'
 *         package_plan:
 *           $ref: '#/components/schemas/PackagePlan'
 *         start_date:
 *           type: string
 *           format: date-time
 *           example: 2025-10-16T10:00:00.000Z
 *         end_date:
 *           type: string
 *           format: date-time
 *           example: 2025-11-15T10:00:00.000Z
 *         amount_paid:
 *           type: number
 *           format: float
 *           example: 44.99
 *         status:
 *           type: string
 *           enum: [active, expired]
 *           example: active
 *         remaining_days:
 *           type: integer
 *           example: 28
 * 
 *     PackagePlanDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         package_id:
 *           type: integer
 *           example: 1
 *         plan_type:
 *           type: string
 *           enum: [monthly, 6_months, yearly]
 *           example: monthly
 *         duration_days:
 *           type: integer
 *           example: 30
 *         price:
 *           type: number
 *           format: float
 *           example: 49.99
 *         discount_type:
 *           type: string
 *           enum: [fixed, percentage]
 *           example: percentage
 *         discount_value:
 *           type: number
 *           format: float
 *           example: 10
 *         final_price:
 *           type: number
 *           format: float
 *           example: 44.99
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           example: active
 *         package:
 *           $ref: '#/components/schemas/Package'
 */

/**
 * @swagger
 * /api/customer/package:
 *   get:
 *     summary: List all available packages with active plans
 *     tags: [CustomerPackages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available packages with active plans
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
 *                   example: Packages retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CustomerPackage'
 */
router.get("/", verifyJwtMiddleware, isCustomer, asyncHandler(customerCtrl.listPackages));

/**
 * @swagger
 * /api/customer/package/plan/{planId}:
 *   get:
 *     summary: Get package plan details
 *     tags: [CustomerPackages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: planId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Package Plan ID
 *     responses:
 *       200:
 *         description: Package plan details retrieved successfully
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
 *                   example: Package plan details retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PackagePlanDetails'
 *       404:
 *         description: Package plan not found
 */
router.get("/plan/:planId", verifyJwtMiddleware, isCustomer, asyncHandler(customerCtrl.getPackagePlanDetails));

/**
 * @swagger
 * /api/customer/package/buy:
 *   post:
 *     summary: Purchase a package plan
 *     tags: [CustomerPackages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - package_plan_id
 *             properties:
 *               package_plan_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Package purchased successfully
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
 *                   example: Package purchased successfully
 *                 data:
 *                   $ref: '#/components/schemas/Purchase'
 *       400:
 *         description: Invalid request or package plan not available
 *       404:
 *         description: Package plan not found
 *       401:
 *         description: Unauthorized
 */
router.post("/buy", upload.none(), verifyJwtMiddleware, isCustomer, asyncHandler(customerCtrl.buyPackage));

/**
 * @swagger
 * /api/customer/package/purchased:
 *   get:
 *     summary: Get user's purchased packages with validity
 *     tags: [CustomerPackages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's purchased packages with validity information
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
 *                   example: Purchased packages retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Purchase'
 */
router.get("/purchased", verifyJwtMiddleware, isCustomer, asyncHandler(customerCtrl.getPurchasedPackages));

module.exports = router;