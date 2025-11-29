const { Package, PackagePlan, Purchase, sequelize } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const { where } = require("sequelize");

// List available packages for customers
exports.listPackages = asyncHandler(async (req, res) => {
  const packages = await Package.findAll({
    where: { status: 'active' },
    attributes: { 
      exclude: ["createdAt", "updatedAt"] 
    },
    include: [{
      model: PackagePlan,
      where: { status: 'active' },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      required: false
    }]
  });

  res.json({
    status: true,
    message: "Packages retrieved successfully",
    data: packages
  });
});

// Buy Package
exports.buyPackage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { package_plan_id } = req.body;

  const packagePlan = await PackagePlan.findByPk(package_plan_id, {
    include: [{
      model: Package,
    }]
  });

  if (!packagePlan) return res.status(404).json({
    status: false,
    message: "Package plan not found",
    data: {}
  });


  if (packagePlan.status !== 'active') return res.status(400).json({
    status: false,
    message: "This package plan is not available",
    data: {}
  });

  const transaction = await sequelize.transaction();
  try {
    const start = new Date();
    const end = new Date(start.getTime() + packagePlan.duration_days * 24 * 60 * 60 * 1000);

    const purchase = await Purchase.create({
      user_id: userId,
      package_id: packagePlan.package_id,
      package_plan_id: package_plan_id,
      start_date: start,
      end_date: end,
      amount_paid: packagePlan.final_price,
      status: "active",
      total_project_limit:packagePlan.Package.max_projects,
      total_created_project:0
    }, { transaction });

    // Increment sell count
    await Package.increment('sell_count', {
      by: 1,
      where: { id: packagePlan.package_id },
      transaction
    });

    await transaction.commit();
    
    res.status(201).json({
      status: true,
      message: "Package purchased successfully",
      data: purchase
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Failed to purchase package",
      data: {}
    });
  }
});

// Get Purchased Packages
exports.getPurchasedPackages = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const purchases = await Purchase.findAll({
    where: { user_id: userId },
   include: [
    {
      model: Package,
    },
    {
      model: PackagePlan,
    }
  ],
    order: [['createdAt', 'DESC']]
  });

  const currentDate = new Date();

  const data = purchases.map((purchase) => {
    const isActive =
      purchase.status === 'active' && new Date(purchase.end_date) > currentDate;

    return {
      id: purchase.id,
      package: purchase,
      start_date: purchase.start_date,
      end_date: purchase.end_date,
      amount_paid: purchase.amount_paid,
      status: isActive ? 'active' : 'expired',
      remaining_days: isActive
        ? Math.ceil((new Date(purchase.end_date) - currentDate) / (1000 * 60 * 60 * 24))
        : 0
    };
  });

  res.status(200).json({
    status: true,
    message: "Purchased packages retrieved successfully",
    data: data
  });
});

// Get Package Plan Details
exports.getPackagePlanDetails = asyncHandler(async (req, res) => {
  const packagePlan = await PackagePlan.findByPk(req.params.planId, {
    include: [{
      model: Package,
      
      where: { status: 'active' }
    }],
    where: { status: 'active' }
  });

  if (!packagePlan) return res.status(404).json({
    status: false,
    message: "Package plan not found",
    data: {}
  });

  res.json({
    status: true,
    message: "Package plan details retrieved successfully",
    data: packagePlan
  });
});