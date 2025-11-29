const express = require("express");
const router = express.Router();
const projectTableCtrl = require("../controllers/customerProjectTable.controller");
const customerDashboardCtrl=require("../controllers/customerDashboard.controller")
const asyncHandler = require("../middlewares/asyncHandler");
const { verifyJwtMiddleware } = require("../middlewares/dashboardJwt");
const isCustomer = require("../middlewares/isCustomer");



router.get("/", verifyJwtMiddleware, isCustomer, asyncHandler(customerDashboardCtrl.getCustomerDashboard));

module.exports = router;