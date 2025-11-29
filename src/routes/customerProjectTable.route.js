const express = require("express");
const router = express.Router();
const projectTableCtrl = require("../controllers/customerProjectTable.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { verifyJwtMiddleware } = require("../middlewares/dashboardJwt");
const isCustomer = require("../middlewares/isCustomer");
const upload = require("../middlewares/upload");

// Create new project table
router.post("/", upload.none(), verifyJwtMiddleware, isCustomer, asyncHandler(projectTableCtrl.createProjectTable));

// Update project table
router.put("/:id", upload.none(), verifyJwtMiddleware, isCustomer, asyncHandler(projectTableCtrl.updateProjectTable));

// Delete project table
router.delete("/:id", verifyJwtMiddleware, isCustomer, asyncHandler(projectTableCtrl.deleteProjectTable));

// Get single project table by ID
router.get("/:id", verifyJwtMiddleware, isCustomer, asyncHandler(projectTableCtrl.getProjectTableById));

// Get project tables by project
router.get("/all/:project_id", verifyJwtMiddleware, isCustomer, asyncHandler(projectTableCtrl.getProjectTables));

// Get all tables for a user (across all projects)
router.get("/", verifyJwtMiddleware, isCustomer, asyncHandler(projectTableCtrl.getAllUserProjectTables));

module.exports = router;