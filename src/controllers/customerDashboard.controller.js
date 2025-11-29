const asyncHandler = require("../middlewares/asyncHandler");
const { User, Project, Purchase, Package, PackagePlan, ProjectTable, sequelize } = require("../models");
const { fn, col, literal } = require("sequelize");


// ===============================
//  CUSTOMER DASHBOARD CONTROLLER
// ===============================
// ===============================
//  CUSTOMER DASHBOARD CONTROLLER
// ===============================
exports.getCustomerDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // ===== GET ALL PURCHASES OF USER =====
  const purchases = await Purchase.findAll({
    where: { user_id: userId },
    include: [
      { model: Package, attributes: ["id", "name"] },
      { model: PackagePlan, attributes: ["plan_type", "price", "duration_days"] }
    ],
    order: [["created_at", "DESC"]]
  });

  // ===== ACTIVE PURCHASE DETAILS =====
  const activePurchase = await Purchase.findAll({
    where: { user_id: userId, status: "active" },
    include: [
      { model: Package },
      { model: PackagePlan }
    ]
  });

  // ===== PROJECT COUNT =====
  const totalProjects = await Project.count({
    where: { user_id: userId }
  });

  // ===== TOTAL TABLE COUNT =====
  const totalTables = await ProjectTable.count({
    include: [
      {
        model: Project,
        where: { user_id: userId }
      }
    ]
  });

  // ===== PROJECT CREATION CHART (LAST 6 MONTHS) =====
  const projectChart = await Project.findAll({
    where: { user_id: userId },
    attributes: [
      [fn("DATE_FORMAT", col("Project.created_at"), "%Y-%m"), "month"], // Specify table
      [fn("COUNT", col("Project.id")), "count"] // Specify table
    ],
    group: ["month"],
    order: [[literal("month"), "ASC"]],
    limit: 6
  });

  // ===== TABLES PER PROJECT =====
  const tableStats = await ProjectTable.findAll({
    attributes: [
      "project_id",
      [fn("COUNT", col("ProjectTable.id")), "tables"] // Specify table
    ],
    group: ["project_id"],
    include: [
      {
        model: Project,
        attributes: ["name"],
        where: { user_id: userId } // Add user filter here too
      }
    ]
  });

  res.status(200).json({
    success: true,
    data: {
      activePurchase,
      totals: {
        totalProjects,
        totalTables,
        totalPurchases: purchases.length
      },
      purchases,
      charts: {
        projectChart,
        tableStats
      }
    }
  });
});
