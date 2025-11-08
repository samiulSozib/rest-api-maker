const { Package } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const { sequelize } = require("../models");

// Create
exports.createPackage = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const pkg = await Package.create(req.body, { transaction });
    await transaction.commit();
    res.status(201).json({status:true, message: "Package created successfully", data: pkg });
  } catch (error) {
    console.log(error)
    await transaction.rollback();
    res.status(500).json({ status:false,message: "Failed to create package",data:{} });
  }
});

// Read all
exports.getAllPackages = asyncHandler(async (req, res) => {
  const packages = await Package.findAll();
  res.json({status:true,message:"Package get success", data: packages });
});

// Read one
exports.getPackageById = asyncHandler(async (req, res) => {
  const pkg = await Package.findByPk(req.params.id);
  if (!pkg) return res.status(404).json({status:false, message: "Package not found",data:{} });
  res.json({status:true,message:"Package get success", data: pkg });
});

// Update
exports.updatePackage = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({status:false, message: "Package not found",data:{} });

    await pkg.update(req.body, { transaction });
    await transaction.commit();

    res.json({status:true, message: "Package updated successfully", data: pkg });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({status:false, message: "Failed to update package", data: {} });
  }
});

// Delete
exports.deletePackage = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({status:false, message: "Package not found",data:{} });

    await pkg.destroy({ transaction });
    await transaction.commit();

    res.json({status:true, message: "Package deleted successfully",data:pkg });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({status:false, message: "Failed to delete package", data:{} });
  }
});
