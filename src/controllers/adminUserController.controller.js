const { Project, User, sequelize, PackagePlan, Package } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const { QueryTypes } = require("sequelize");

// ✅ Get all users
exports.getAllUsers = asyncHandler(async (req, res) => {

  // 🔹 Query params
  const {
    page = 1,
    limit = 10,
    search = "",
  } = req.query;

  const offset = (page - 1) * limit;

  // 🔹 Build WHERE conditions
  let whereCondition = {
    role:"user"
  };

  // 🔍 Search by name or description
  if (search.trim() !== "") {
    whereCondition[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

 

  // 🔹 Fetch projects with pagination
  const { rows, count } = await User.findAndCountAll({
    where: whereCondition,
    
    limit: parseInt(limit),
    offset,
    order: [["id", "DESC"]]
  });

  res.json({
    status: true,
    message: "User fetched successfully",
    data: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit)
    },
    
  });
});