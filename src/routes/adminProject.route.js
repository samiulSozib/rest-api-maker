const express = require("express");
const router = express.Router();
const adminProjectCtrl = require("../controllers/adminProject.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { verifyJwtMiddleware } = require("../middlewares/dashboardJwt");
const isAdmin = require("../middlewares/isAdmin");

/**
 * @swagger
 * tags:
 *   name: AdminProjects
 *   description: Admin project management
 */

/**
 * @swagger
 * /api/admin/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [AdminProjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all projects
 */
router.get("/", verifyJwtMiddleware, isAdmin, asyncHandler(adminProjectCtrl.getAllProjects));

/**
 * @swagger
 * /api/admin/projects/{id}:
 *   get:
 *     summary: Get a single project by ID
 *     tags: [AdminProjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 */
router.get("/:id", verifyJwtMiddleware, isAdmin, asyncHandler(adminProjectCtrl.getProjectById));

/**
 * @swagger
 * /api/admin/projects/user/{user_id}:
 *   get:
 *     summary: Get all projects of a specific user
 *     tags: [AdminProjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User projects
 */
router.get("/user/:user_id", verifyJwtMiddleware, isAdmin, asyncHandler(adminProjectCtrl.getProjectsByUserId));

/**
 * @swagger
 * /api/admin/projects/{id}/status:
 *   patch:
 *     summary: Change project status
 *     tags: [AdminProjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               status:
 *                 type: string
 *                 enum: [active, suspended]
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Project not found
 */
router.patch("/:id/status", verifyJwtMiddleware, isAdmin, asyncHandler(adminProjectCtrl.changeProjectStatus));

/**
 * @swagger
 * /api/admin/projects/{id}:
 *   delete:
 *     summary: Delete a project and its database
 *     tags: [AdminProjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete("/:id", verifyJwtMiddleware, isAdmin, asyncHandler(adminProjectCtrl.deleteProject));

module.exports = router;
