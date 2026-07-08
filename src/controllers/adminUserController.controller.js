const { User, sequelize } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const { Op } = require("sequelize");

exports.getAllUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
  } = req.query;

  const offset = (page - 1) * limit;

  let whereCondition = {
    role: "user"
  };

  if (search.trim() !== "") {
    whereCondition[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }

  const { rows, count } = await User.findAndCountAll({
    where: whereCondition,
    limit: parseInt(limit),
    offset,
    order: [["id", "DESC"]]
  });

  res.json({
    status: true,
    message: "Users fetched successfully",
    data: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit)
    },
  });
});
