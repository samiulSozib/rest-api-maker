const { Purchase, User, Package, sequelize } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");

// ✅ Get all purchases (with user + package info)
exports.getAllPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.findAll({
    include: [
      { model: User, attributes: ["id", "name", "email"] },
      { model: Package, attributes: ["id", "name", "price", "duration_days"] },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({ count: purchases.length, data: purchases });
});

// ✅ Get single purchase by ID
exports.getPurchaseById = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findByPk(req.params.id, {
    include: [
      { model: User, attributes: ["id", "name", "email"] },
      { model: Package, attributes: ["id", "name", "price", "duration_days"] },
    ],
  });

  if (!purchase) return res.status(404).json({ error: "Purchase not found" });

  res.status(200).json({ data: purchase });
});

// ✅ Delete a purchase
exports.deletePurchase = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase) return res.status(404).json({ error: "Purchase not found" });

    await purchase.destroy({ transaction });
    await transaction.commit();

    res.status(200).json({ message: "Purchase deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: "Failed to delete purchase", details: error.message });
  }
});

// ✅ Update purchase status (active, expired, cancelled)
exports.updatePurchaseStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["active", "expired", "cancelled"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const transaction = await sequelize.transaction();
  try {
    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase) return res.status(404).json({ error: "Purchase not found" });

    await purchase.update({ status }, { transaction });
    await transaction.commit();

    res.status(200).json({ message: "Purchase status updated", data: purchase });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: "Failed to update status", details: error.message });
  }
});


// ✅ Get all purchases by a single user ID
exports.getPurchasesByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const purchases = await Purchase.findAll({
    where: { user_id: userId },
    include: [
      { model: Package, attributes: ["id", "name", "price", "duration_days"] },
    ],
    order: [["createdAt", "DESC"]],
  });

  if (!purchases.length)
    return res.status(404).json({ success: false, message: "No purchases found for this user" });

  res.json({ success: true, data: purchases });
});