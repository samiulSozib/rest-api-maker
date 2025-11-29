const asyncHandler = require("../middlewares/asyncHandler");
const { User, Project, Package, Purchase, Payment, sequelize } = require("../models");
const { Op, fn, col, literal } = require("sequelize");


// ===============================
//  ADMIN DASHBOARD CONTROLLER
// ===============================
exports.getAdminDashboard = asyncHandler(async (req, res) => {
  
  // ===== BASIC COUNTS =====
  const totalUsers = await User.count();
  const activeUsers = await User.count({ where: { role: "user" } });

  const totalProjects = await Project.count();
  const totalPackages = await Package.count();
  const totalPurchases = await Purchase.count();

  const totalRevenue = await Payment.sum("amount") || 0;


  // ===== PURCHASE STATUS STATS =====
  const purchaseStatusStats = await Purchase.findAll({
    attributes: [
      "status",
      [fn("COUNT", col("id")), "count"]
    ],
    group: ["status"]
  });


  // ===== MONTHLY REVENUE CHART =====
  const monthlyRevenue = await Payment.findAll({
    attributes: [
      [fn("DATE_FORMAT", col("created_at"), "%Y-%m"), "month"],
      [fn("SUM", col("amount")), "total"]
    ],
    group: ["month"],
    order: [[literal("month"), "ASC"]]
  });


  // ===== TOP SELLING PACKAGES =====
  const topSellingPackages = await Purchase.findAll({
    attributes: [
      "package_id",
      [fn("COUNT", col("package_id")), "sales"]
    ],
    include: [
      {
        model: Package,
        attributes: ["name"]
      }
    ],
    group: ["package_id"],
    order: [[literal("sales"), "DESC"]],
    limit: 5
  });


  // ===== USER GROWTH (LAST 6 MONTHS) =====
  const userGrowth = await User.findAll({
    attributes: [
      [fn("DATE_FORMAT", col("created_at"), "%Y-%m"), "month"],
      [fn("COUNT", col("id")), "count"]
    ],
    group: ["month"],
    order: [[literal("month"), "ASC"]],
    limit: 6
  });


  res.status(200).json({
    success: true,
    data: {
      totals: {
        totalUsers,
        activeUsers,
        totalProjects,
        totalPackages,
        totalPurchases,
        totalRevenue,
      },
      charts: {
        purchaseStatusStats,
        monthlyRevenue,
        topSellingPackages,
        userGrowth,
      }
    }
  });
});
