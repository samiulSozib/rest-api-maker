const { Project, Purchase, sequelize, PackagePlan, Package } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const { QueryTypes } = require("sequelize");
const { Op } = require("sequelize");


// ✅ Create new project (with DB creation)
exports.createProject = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, description, package_plan_id } = req.body;

  // check user’s active package
  const activePackage = await Purchase.findOne({
    where: { user_id: userId, status: "active",package_plan_id:package_plan_id },
  });

  const packageInfo=await PackagePlan.findByPk(package_plan_id,{include:[{model:Package}]}) 

  if (!activePackage)
    return res.status(403).json({
      status: false,
      message: "No active package found. Please purchase a package first.",
      error: "No active package found. Please purchase a package first.",
    });
    //return res.json(packageInfo.Package.max_tables_per_project)

  // generate unique DB name
  const dbName = `proj_${userId}_${Date.now()}`;

  const transaction = await sequelize.transaction();
  try {
    // create new database in MySQL server
    // await sequelize.query(`CREATE DATABASE \`${dbName}\`;`, {
    //   type: QueryTypes.RAW,
    //   transaction,
    // });

    // create project entry
    const project = await Project.create(
      {
        user_id: userId,
        name,
        description,
        db_name: dbName,
        status: "active",
        package_plan_id,
        total_table_limit:packageInfo.Package.max_tables_per_project,
        total_created_table:0
      },
      { transaction }
    );

    const activePurchase = await Purchase.findOne({ where: { user_id: userId, package_plan_id: package_plan_id } })
    if (!activePurchase)
      return res.status(403).json({
        status: false,
        message: "No active purchase found. Please purchase a package first.",
        error: "No active purchase found. Please purchase a package first.",
      });
    const total_created_project = activePurchase.total_created_project + 1;

    await Purchase.update(
      { total_created_project },
      {
        where: { user_id: userId, package_plan_id: package_plan_id },
        transaction
      }
    );


    await transaction.commit();
    res.status(201).json({
      status: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      status: false,
      message: "Failed to create project",
      error: "Failed to create project",
      details: error.message,
    });
  }
});

// ✅ Edit project
exports.updateProject = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { name, description } = req.body;

  const project = await Project.findOne({ where: { id, user_id: userId } });
  if (!project)
    return res.status(404).json({
      status: false,
      message: "Project not found",
      error: "Project not found",
    });

  await project.update({ name, description });
  res.json({
    status: true,
    message: "Project updated successfully",
    data: project,
  });
});

// ✅ Delete project (optional: drop its database)
exports.deleteProject = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const project = await Project.findOne({ where: { id, user_id: userId } });
  if (!project)
    return res.status(404).json({
      status: false,
      message: "Project not found",
      error: "Project not found",
    });

  const transaction = await sequelize.transaction();
  try {
    // await sequelize.query(`DROP DATABASE IF EXISTS \`${project.db_name}\`;`, {
    //   type: QueryTypes.RAW,
    //   transaction,
    // });

    await project.destroy({ transaction });
    await transaction.commit();

    res.json({
      status: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      status: false,
      message: "Failed to delete project",
      error: "Failed to delete project",
      details: error.message,
    });
  }
});

// ✅ Change project status (active/suspended)
exports.changeProjectStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { status } = req.body;

  const project = await Project.findOne({ where: { id, user_id: userId } });
  if (!project)
    return res.status(404).json({
      status: false,
      message: "Project not found",
      error: "Project not found",
    });

  project.status = status;
  await project.save();

  res.json({
    status: true,
    message: "Project status updated",
    data: project,
  });
});

// ✅ Get single project by ID
exports.getProjectById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const project = await Project.findOne({ where: { id, user_id: userId } });
  if (!project)
    return res.status(404).json({
      status: false,
      message: "Project not found",
      error: "Project not found",
    });

  res.json({
    status: true,
    message: "Project fetched successfully",
    data: project,
  });
});

// ✅ Get projects by user
exports.getProjects = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 🔹 Query params
  const {
    page = 1,
    limit = 10,
    search = "",
    status,
  } = req.query;

  const offset = (page - 1) * limit;

  // 🔹 Build WHERE conditions
  let whereCondition = {
    user_id: userId,
  };

  // 🔍 Search by name or description
  if (search.trim() !== "") {
    whereCondition[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

  // 🔍 Filter by status
  if (status && ['active', 'inactive', 'suspended'].includes(status)) {
    whereCondition.status = status;
  }

  // 🔹 Fetch projects with pagination
  const { rows, count } = await Project.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: PackagePlan,
        include: [
          {
            model: Package
          }
        ]
      }
    ],
    limit: parseInt(limit),
    offset,
    order: [["id", "DESC"]]
  });

  res.json({
    status: true,
    message: "Projects fetched successfully",
    data: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit)
    },

  });
});
