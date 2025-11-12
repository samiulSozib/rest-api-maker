const express = require("express");
const router = express.Router();
const adminCtrl = require("../controllers/adminPackage.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { verifyJwtMiddleware } = require("../middlewares/dashboardJwt");
const { validate } = require("../middlewares/validate");
const { createPackageValidator, updatePackageValidator } = require("../validator/package.validator");
const upload = require("../middlewares/upload");
const isAdmin = require("../middlewares/isAdmin");

/**
 * @swagger
 * tags:
 *   name: AdminPackages
 *   description: Admin CRUD operations for managing packages and plans
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Package:
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
 *         status:
 *           type: string
 *           enum: [active, inactive, archived]
 *           example: active
 *         sell_count:
 *           type: integer
 *           example: 150
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
 *             custom_domains:
 *               type: integer
 *               example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     PackagePlan:
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
 * 
 *     PackageWithPlans:
 *       allOf:
 *         - $ref: '#/components/schemas/Package'
 *         - type: object
 *           properties:
 *             plans:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PackagePlan'
 */

/**
 * @swagger
 * /api/admin/package:
 *   post:
 *     summary: Create a new package with plans
 *     tags: [AdminPackages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - base_price
 *               - plans
 *             properties:
 *               name:
 *                 type: string
 *                 example: Professional Plan
 *               base_price:
 *                 type: number
 *                 format: float
 *                 example: 49.99
 *               status:
 *                 type: string
 *                 enum: [active, inactive, archived]
 *                 example: active
 *               max_projects:
 *                 type: integer
 *                 example: 10
 *               max_tables_per_project:
 *                 type: integer
 *                 example: 50
 *               features:
 *                 type: object
 *                 example: {"priority_support": true, "advanced_analytics": true, "custom_domains": 1}
 *               plans:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - plan_type
 *                     - duration_days
 *                     - price
 *                     - final_price
 *                   properties:
 *                     plan_type:
 *                       type: string
 *                       enum: [monthly, 6_months, yearly]
 *                       example: monthly
 *                     duration_days:
 *                       type: integer
 *                       example: 30
 *                     price:
 *                       type: number
 *                       format: float
 *                       example: 49.99
 *                     discount_type:
 *                       type: string
 *                       enum: [fixed, percentage]
 *                       example: percentage
 *                     discount_value:
 *                       type: number
 *                       format: float
 *                       example: 10
 *                     final_price:
 *                       type: number
 *                       format: float
 *                       example: 44.99
 *     responses:
 *       201:
 *         description: Package created successfully with plans
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
 *                   example: Package created successfully
 *                 data:
 *                   $ref: '#/components/schemas/PackageWithPlans'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", upload.none(), verifyJwtMiddleware, isAdmin, createPackageValidator, validate, asyncHandler(adminCtrl.createPackage));

/**
 * @swagger
 * /api/admin/package:
 *   get:
 *     summary: Get all packages with their plans
 *     tags: [AdminPackages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all packages with plans
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
 *                     $ref: '#/components/schemas/PackageWithPlans'
 */
router.get("/", verifyJwtMiddleware, isAdmin, asyncHandler(adminCtrl.getAllPackages));

/**
 * @swagger
 * /api/admin/package/{id}:
 *   get:
 *     summary: Get package details by ID with plans
 *     tags: [AdminPackages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Package ID
 *     responses:
 *       200:
 *         description: Package details with plans
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
 *                   example: Package retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PackageWithPlans'
 *       404:
 *         description: Package not found
 */
router.get("/:id", verifyJwtMiddleware, isAdmin, asyncHandler(adminCtrl.getPackageById));

/**
 * @swagger
 * /api/admin/package/{id}:
 *   put:
 *     summary: Update an existing package and its plans
 *     tags: [AdminPackages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Professional Plan
 *               base_price:
 *                 type: number
 *                 example: 59.99
 *               status:
 *                 type: string
 *                 enum: [active, inactive, archived]
 *                 example: active
 *               max_projects:
 *                 type: integer
 *                 example: 20
 *               max_tables_per_project:
 *                 type: integer
 *                 example: 100
 *               features:
 *                 type: object
 *                 example: {"priority_support": true, "advanced_analytics": true, "custom_domains": 3}
 *               plans:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     plan_type:
 *                       type: string
 *                       enum: [monthly, 6_months, yearly]
 *                     duration_days:
 *                       type: integer
 *                     price:
 *                       type: number
 *                       format: float
 *                     discount_type:
 *                       type: string
 *                       enum: [fixed, percentage]
 *                     discount_value:
 *                       type: number
 *                       format: float
 *                     final_price:
 *                       type: number
 *                       format: float
 *                     status:
 *                       type: string
 *                       enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Package updated successfully
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
 *                   example: Package updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/PackageWithPlans'
 *       404:
 *         description: Package not found
 */
router.put("/:id", upload.none(), verifyJwtMiddleware, isAdmin, updatePackageValidator, validate, asyncHandler(adminCtrl.updatePackage));

/**
 * @swagger
 * /api/admin/package/{id}/status:
 *   patch:
 *     summary: Update package status
 *     tags: [AdminPackages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, archived]
 *                 example: inactive
 *     responses:
 *       200:
 *         description: Package status updated successfully
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
 *                   example: Package status updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Package'
 *       404:
 *         description: Package not found
 */
router.patch("/:id/status", upload.none(), verifyJwtMiddleware, isAdmin, asyncHandler(adminCtrl.updatePackageStatus));

/**
 * @swagger
 * /api/admin/package/{id}:
 *   delete:
 *     summary: Delete a package and its associated plans
 *     tags: [AdminPackages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Package deleted successfully
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
 *                   example: Package deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/Package'
 *       404:
 *         description: Package not found
 */
router.delete("/:id", verifyJwtMiddleware, isAdmin, asyncHandler(adminCtrl.deletePackage));

module.exports = router;