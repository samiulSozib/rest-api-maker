const { Package, Purchase, sequelize } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");

exports.listPackages = asyncHandler(async (req, res) => {
  const packages = await Package.findAll({ attributes: { exclude: ["createdAt", "updatedAt"] } });
  res.json({ data: packages });
});

exports.buyPackage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { package_id } = req.body;

  const pkg = await Package.findByPk(package_id);
  if (!pkg) return res.status(404).json({ error: "Package not found"+package_id });

  const transaction = await sequelize.transaction();
  try {
    const start = new Date();
    const end = new Date(start.getTime() + pkg.duration_days * 24 * 60 * 60 * 1000);

    const purchase = await Purchase.create({
      user_id: userId,
      package_id,
      start_date: start,
      end_date: end,
      status: "active",
    }, { transaction });

    await transaction.commit();
    res.status(201).json({ message: "Package purchased successfully", data: purchase });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: "Failed to purchase package", details: error.message });
  }
});


exports.getPurchasedPackages = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const purchases = await Purchase.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Package,
        attributes: ['id', 'name', 'price', 'duration_days', 'features']
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
      package: purchase.Package,
      start_date: purchase.start_date,
      end_date: purchase.end_date,
      status: isActive ? 'active' : 'expired',
      remaining_days: isActive
        ? Math.ceil((new Date(purchase.end_date) - currentDate) / (1000 * 60 * 60 * 24))
        : 0
    };
  });

  res.status(200).json({ data });
});
