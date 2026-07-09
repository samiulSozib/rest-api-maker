const express = require("express");
const router = express.Router();
const projectTableCtrl = require("../controllers/customerProjectTable.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { verifyJwtMiddleware } = require("../middlewares/dashboardJwt");
const { validate } = require("../middlewares/validate");
const { createTableValidator } = require("../validator/project.validator");
const isCustomer = require("../middlewares/isCustomer");
const upload = require("../middlewares/upload");

// Create new project table
router.post("/", upload.none(), verifyJwtMiddleware, isCustomer, createTableValidator, validate, asyncHandler(projectTableCtrl.createProjectTable));

// Get all tables for a user (across all projects) — static before /:id
router.get("/", verifyJwtMiddleware, isCustomer, asyncHandler(projectTableCtrl.getAllUserProjectTables));

// Get project tables by project — specific path before /:id
router.get("/all/:project_id", verifyJwtMiddleware, isCustomer, asyncHandler(projectTableCtrl.getProjectTables));

// Get single project table by ID
router.get("/:id", verifyJwtMiddleware, isCustomer, asyncHandler(projectTableCtrl.getProjectTableById));

// Update project table
router.put("/:id", upload.none(), verifyJwtMiddleware, isCustomer, asyncHandler(projectTableCtrl.updateProjectTable));

// Delete project table
router.delete("/:id", verifyJwtMiddleware, isCustomer, asyncHandler(projectTableCtrl.deleteProjectTable));

module.exports = router;
