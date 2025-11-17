const { Package, PackagePlan, sequelize } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const { calculateFinalPrice } = require("../utils/calculate_final_price");
const { validateDuplicatePlans } = require("../utils/validate_duplicate_plan");





// Create Package
exports.createPackage = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      name,
      max_projects,
      max_tables_per_project,
      features,
      plans,
    } = req.body;

    // ✅ Validate duplicate plans before creating
    const duplicateError = validateDuplicatePlans(plans);
    if (duplicateError) {
      return res.status(400).json({
        status: false,
        message: duplicateError,
        data: {}
      });
    }

    // ✅ Calculate final prices for plans
    const plansWithFinalPrice = plans && plans.map(plan => ({
      ...plan,
      final_price: calculateFinalPrice(
        plan.price,
        plan.discount_type,
        plan.discount_value
      )
    }));

    // ✅ Create package
    const pkg = await Package.create(
      {
        name,
        max_projects,
        max_tables_per_project,
        features,
      },
      { transaction }
    );

    // ✅ Create package plans
    if (plansWithFinalPrice && plansWithFinalPrice.length > 0) {
      const planData = plansWithFinalPrice.map((plan) => ({
        package_id: pkg.id,
        plan_type: plan.plan_type,
        duration_days: plan.duration_days,
        price: plan.price,
        discount_type: plan.discount_type,
        discount_value: plan.discount_value,
        final_price: plan.final_price,
      }));

      await PackagePlan.bulkCreate(planData, { transaction });
    }

    await transaction.commit();

    // ✅ Fetch package with plans
    const packageWithPlans = await Package.findByPk(pkg.id, {
      include: [{ model: PackagePlan }],
    });

    res.status(201).json({
      status: true,
      message: "Package created successfully",
      data: packageWithPlans,
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Failed to create package",
      data: {},
    });
  }
});

// Get All Packages (Admin)
exports.getAllPackages = asyncHandler(async (req, res) => {
  const packages = await Package.findAll({
    include: [{
      model: PackagePlan,
    }],
    order: [['id', 'ASC']]
  });
  
  res.json({
    status: true,
    message: "Packages retrieved successfully",
    data: packages
  });
});

// Get Package by ID
exports.getPackageById = asyncHandler(async (req, res) => {
  const pkg = await Package.findByPk(req.params.id, {
    include: [{
      model: PackagePlan,
    }]
  });
  
  if (!pkg) return res.status(404).json({
    status: false,
    message: "Package not found",
    data: {}
  });
  
  res.json({
    status: true,
    message: "Package retrieved successfully",
    data: pkg
  });
});

// Update Package
exports.updatePackage = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { plans, ...packageData } = req.body;
    
    const pkg = await Package.findByPk(req.params.id, {
      include: [{ model: PackagePlan }]
    });
    if (!pkg) return res.status(404).json({
      status: false,
      message: "Package not found",
      data: {}
    });

    // ✅ Validate duplicate plans before updating
    if (plans && plans.length > 0) {
      const duplicateError = validateDuplicatePlans(plans, pkg.PackagePlans || []);
      if (duplicateError) {
        await transaction.rollback();
        return res.status(400).json({
          status: false,
          message: duplicateError,
          data: {}
        });
      }
    }

    await pkg.update(packageData, { transaction });

    // Update plans if provided
    if (plans && plans.length > 0) {
      for (const plan of plans) {
        // Calculate final price for each plan
        const finalPrice = calculateFinalPrice(
          plan.price,
          plan.discount_type,
          plan.discount_value
        );

        const planData = {
          ...plan,
          final_price: finalPrice
        };

        if (plan.id) {
          // Update existing plan
          await PackagePlan.update(planData, {
            where: { id: plan.id, package_id: pkg.id },
            transaction
          });
        } else {
          // Create new plan
          await PackagePlan.create({
            ...planData,
            package_id: pkg.id
          }, { transaction });
        }
      }
    }

    await transaction.commit();

    // Fetch updated package with plans
    const updatedPackage = await Package.findByPk(pkg.id, {
      include: [{
        model: PackagePlan,
      }]
    });

    res.json({
      status: true,
      message: "Package updated successfully",
      data: updatedPackage
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Failed to update package",
      data: {}
    });
  }
});

// Update Package Status
exports.updatePackageStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    const pkg = await Package.findByPk(req.params.id);
    
    if (!pkg) return res.status(404).json({
      status: false,
      message: "Package not found",
      data: {}
    });

    await pkg.update({ status });
    
    res.json({
      status: true,
      message: "Package status updated successfully",
      data: pkg
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to update package status",
      data: {}
    });
  }
});

// Delete Package
exports.deletePackage = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({
      status: false,
      message: "Package not found",
      data: {}
    });

    // Delete associated plans first
    await PackagePlan.destroy({
      where: { package_id: pkg.id },
      transaction
    });

    await pkg.destroy({ transaction });
    await transaction.commit();

    res.json({
      status: true,
      message: "Package deleted successfully",
      data: pkg
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      status: false,
      message: "Failed to delete package",
      data: {}
    });
  }
});