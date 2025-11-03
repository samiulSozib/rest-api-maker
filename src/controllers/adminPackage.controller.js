const { Package } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const { sequelize } = require("../models");

// Create
exports.createPackage = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const pkg = await Package.create(req.body, { transaction });
    await transaction.commit();
    res.status(201).json({ message: "Package created successfully", data: pkg });
  } catch (error) {
    console.log(error)
    await transaction.rollback();
    res.status(500).json({ error: "Failed to create package", details: error.message });
  }
});

// Read all
exports.getAllPackages = asyncHandler(async (req, res) => {
  const packages = await Package.findAll();
  res.json({ data: packages });
});

// Read one
exports.getPackageById = asyncHandler(async (req, res) => {
  const pkg = await Package.findByPk(req.params.id);
  if (!pkg) return res.status(404).json({ error: "Package not found" });
  res.json({ data: pkg });
});

// Update
exports.updatePackage = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({ error: "Package not found" });

    await pkg.update(req.body, { transaction });
    await transaction.commit();

    res.json({ message: "Package updated successfully", data: pkg });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: "Failed to update package", details: error.message });
  }
});

// Delete
exports.deletePackage = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({ error: "Package not found" });

    await pkg.destroy({ transaction });
    await transaction.commit();

    res.json({ message: "Package deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: "Failed to delete package", details: error.message });
  }
});
