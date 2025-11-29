const express = require("express");
const router = express.Router();
const adminDashboardCtrl=require("../controllers/adminDashboard.controller")
const asyncHandler = require("../middlewares/asyncHandler");
const { verifyJwtMiddleware } = require("../middlewares/dashboardJwt");
const isAdmin = require("../middlewares/isAdmin");



router.get("/", verifyJwtMiddleware, isAdmin, asyncHandler(adminDashboardCtrl.getAdminDashboard));

module.exports = router;