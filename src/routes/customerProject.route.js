const express = require("express");
const router = express.Router();
const customerProjectCtrl = require("../controllers/customerProject.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { verifyJwtMiddleware } = require("../middlewares/dashboardJwt");
const isCustomer = require("../middlewares/isCustomer");
const upload = require("../middlewares/upload");

/**
 * @swagger
 * tags:
 *   name: CustomerProjects
 *   description: Customer project management (create, update, delete, status)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         db_name:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, suspended]
 */

/**
 * @swagger
 * /api/customer/projects:
 *   post:
 *     summary: Create a new project (also creates database)
 *     tags: [CustomerProjects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: My First Project
 *               description:
 *                 type: string
 *                 example: This project manages employee data
 *     responses:
 *       201:
 *         description: Project created successfully
 *       403:
 *         description: No active package found
 *       500:
 *         description: Server error
 */
router.post("/",upload.none(), verifyJwtMiddleware, isCustomer, asyncHandler(customerProjectCtrl.createProject));

/**
 * @swagger
 * /api/customer/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [CustomerProjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 */
router.put("/:id",upload.none(), verifyJwtMiddleware, isCustomer, asyncHandler(customerProjectCtrl.updateProject));

/**
 * @swagger
 * /api/customer/projects/{id}:
 *   delete:
 *     summary: Delete a project and drop its database
 *     tags: [CustomerProjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete("/:id", verifyJwtMiddleware, isCustomer, asyncHandler(customerProjectCtrl.deleteProject));

/**
 * @swagger
 * /api/customer/projects/{id}/status:
 *   patch:
 *     summary: Change project status
 *     tags: [CustomerProjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, suspended]
 *                 example: suspended
 *     responses:
 *       200:
 *         description: Project status updated
 *       404:
 *         description: Project not found
 */
router.patch("/:id/status", verifyJwtMiddleware, isCustomer, asyncHandler(customerProjectCtrl.changeProjectStatus));

/**
 * @swagger
 * /api/customer/projects/{id}:
 *   get:
 *     summary: Get a single project by ID
 *     tags: [CustomerProjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.get("/:id", verifyJwtMiddleware, isCustomer, asyncHandler(customerProjectCtrl.getProjectById));


module.exports = router;
