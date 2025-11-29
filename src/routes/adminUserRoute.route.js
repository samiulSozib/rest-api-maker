const express = require("express");
const router = express.Router();
const adminUserCtrl = require("../controllers/adminUserController.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const { verifyJwtMiddleware } = require("../middlewares/dashboardJwt");
const isAdmin = require("../middlewares/isAdmin");


router.get("/", verifyJwtMiddleware, isAdmin, asyncHandler(adminUserCtrl.getAllUsers));

module.exports=router