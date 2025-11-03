const { Project, Purchase, sequelize } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const { QueryTypes } = require("sequelize");

// ✅ Create new project (with DB creation)
exports.createProject = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, description } = req.body;

  // check user’s active package
  const activePackage = await Purchase.findOne({
    where: { user_id: userId, status: "active" },
  });

  if (!activePackage)
    return res.status(403).json({
      error: "No active package found. Please purchase a package first.",
    });

  // generate unique DB name
  const dbName = `proj_${userId}_${Date.now()}`;

  const transaction = await sequelize.transaction();
  try {
    // create new database in MySQL server
    await sequelize.query(`CREATE DATABASE \`${dbName}\`;`, {
      type: QueryTypes.RAW,
      transaction,
    });

    // create project entry
    const project = await Project.create(
      {
        user_id: userId,
        name,
        description,
        db_name: dbName,
        status: "active",
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({ message: "Project created successfully", data: project });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
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
    return res.status(404).json({ error: "Project not found" });

  await project.update({ name, description });
  res.json({ message: "Project updated successfully", data: project });
});

// ✅ Delete project (optional: drop its database)
exports.deleteProject = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const project = await Project.findOne({ where: { id, user_id: userId } });
  if (!project)
    return res.status(404).json({ error: "Project not found" });

  const transaction = await sequelize.transaction();
  try {
    await sequelize.query(`DROP DATABASE IF EXISTS \`${project.db_name}\`;`, {
      type: QueryTypes.RAW,
      transaction,
    });

    await project.destroy({ transaction });
    await transaction.commit();

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
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
    return res.status(404).json({ error: "Project not found" });

  project.status = status;
  await project.save();

  res.json({ message: "Project status updated", data: project });
});


// ✅ Get single project by ID
exports.getProjectById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const project = await Project.findOne({ where: { id, user_id: userId } });
  if (!project)
    return res.status(404).json({ error: "Project not found" });

  res.json({ data: project });
});
