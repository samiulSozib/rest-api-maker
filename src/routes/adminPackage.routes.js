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
 *   description: Admin CRUD operations for managing packages
 */

/**
 * @swagger
 * /api/admin/package:
 *   post:
 *     summary: Create a new package
 *     tags: [AdminPackages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - duration_days
 *             properties:
 *               name:
 *                 type: string
 *                 example: Premium Plan
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 49.99
 *               duration_days:
 *                 type: integer
 *                 example: 30
 *               max_projects:
 *                 type: integer
 *                 example: 10
 *               max_tables_per_project:
 *                 type: integer
 *                 example: 50
 *               features:
 *                 type: string
 *                 description: JSON string of package features
 *                 example: '{"support":"priority","backup":"daily"}'
 *     responses:
 *       201:
 *         description: Package created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/",upload.none(), verifyJwtMiddleware,isAdmin, createPackageValidator, validate, asyncHandler(adminCtrl.createPackage));

/**
 * @swagger
 * /api/admin/package:
 *   get:
 *     summary: Get all packages
 *     tags: [AdminPackages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all packages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Package'
 */
router.get("/", verifyJwtMiddleware,isAdmin, asyncHandler(adminCtrl.getAllPackages));

/**
 * @swagger
 * /api/admin/package/{id}:
 *   get:
 *     summary: Get package details by ID
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
 *         description: Package details
 *       404:
 *         description: Package not found
 */
router.get("/:id", verifyJwtMiddleware,isAdmin, asyncHandler(adminCtrl.getPackageById));

/**
 * @swagger
 * /api/admin/package/{id}:
 *   put:
 *     summary: Update an existing package
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Premium Plan
 *               price:
 *                 type: number
 *                 example: 59.99
 *               duration_days:
 *                 type: integer
 *                 example: 60
 *               max_projects:
 *                 type: integer
 *                 example: 20
 *               max_tables_per_project:
 *                 type: integer
 *                 example: 100
 *               features:
 *                 type: string
 *                 description: JSON string of features
 *                 example: '{"support":"24/7","backup":"weekly"}'
 *     responses:
 *       200:
 *         description: Package updated successfully
 *       404:
 *         description: Package not found
 */
router.put("/:id",upload.none(), verifyJwtMiddleware,isAdmin, updatePackageValidator, validate, asyncHandler(adminCtrl.updatePackage));

/**
 * @swagger
 * /api/admin/package/{id}:
 *   delete:
 *     summary: Delete a package
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
 *       404:
 *         description: Package not found
 */
router.delete("/:id", verifyJwtMiddleware,isAdmin, asyncHandler(adminCtrl.deletePackage));

module.exports = router;
