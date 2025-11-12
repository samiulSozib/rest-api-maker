const { Package, PackagePlan, sequelize } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");

// Create Package
exports.createPackage = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, base_price, max_projects, max_tables_per_project, features, plans } = req.body;

    const pkg = await Package.create({
      name,
      base_price,
      max_projects,
      max_tables_per_project,
      features
    }, { transaction });

    // Create package plans
    if (plans && plans.length > 0) {
      const planData = plans.map(plan => ({
        package_id: pkg.id,
        plan_type: plan.plan_type,
        duration_days: plan.duration_days,
        price: plan.price,
        discount_type: plan.discount_type,
        discount_value: plan.discount_value,
        final_price: plan.final_price
      }));
      console.log(planData)
      
      await PackagePlan.bulkCreate(planData, { transaction });
      
    }

    await transaction.commit();
    
    // Fetch package with plans
    const packageWithPlans = await Package.findByPk(pkg.id, {
      include: [{
        model: PackagePlan,
        
      }]
    });

    res.status(201).json({
      status: true,
      message: "Package created successfully",
      data: packageWithPlans
    });
  } catch (error) {
    await transaction.rollback();
    
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Failed to create package",
      data: {}
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
    
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({
      status: false,
      message: "Package not found",
      data: {}
    });

    await pkg.update(packageData, { transaction });

    // Update plans if provided
    if (plans && plans.length > 0) {
      for (const plan of plans) {
        if (plan.id) {
          // Update existing plan
          await PackagePlan.update(plan, {
            where: { id: plan.id, package_id: pkg.id },
            transaction
          });
        } else {
          // Create new plan
          await PackagePlan.create({
            ...plan,
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