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
 * /api/customer/package:
 *   get:
 *     summary: List all available packages
 *     tags: [CustomerPackages]
 *     responses:
 *       200:
 *         description: List of available packages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Package'
 */
router.get("/",verifyJwtMiddleware,isCustomer, asyncHandler(customerCtrl.listPackages));

/**
 * @swagger
 * /api/customer/package/buy:
 *   post:
 *     summary: Purchase a package
 *     tags: [CustomerPackages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - package_id
 *             properties:
 *               package_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Package purchased successfully
 *       400:
 *         description: Invalid request or already purchased
 *       401:
 *         description: Unauthorized
 */
router.post("/buy",upload.none(), verifyJwtMiddleware,isCustomer, asyncHandler(customerCtrl.buyPackage));

/**
 * @swagger
 * /api/customer/package/purchased:
 *   get:
 *     summary: Get user's purchased packages
 *     tags: [CustomerPackages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's purchased packages with validity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       package:
 *                         $ref: '#/components/schemas/Package'
 *                       start_date:
 *                         type: string
 *                         example: 2025-10-16T10:00:00.000Z
 *                       end_date:
 *                         type: string
 *                         example: 2025-11-15T10:00:00.000Z
 *                       status:
 *                         type: string
 *                         example: active
 *                       remaining_days:
 *                         type: integer
 *                         example: 28
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/purchased",
  verifyJwtMiddleware,
  isCustomer,
  asyncHandler(customerCtrl.getPurchasedPackages)
);


module.exports = router;
