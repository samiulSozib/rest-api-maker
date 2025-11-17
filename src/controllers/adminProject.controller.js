const { Project, User, sequelize } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const { QueryTypes } = require("sequelize");

// ✅ Get all projects
exports.getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.findAll({
    include: [{ model: User, attributes: ["id", "name", "email"] }],
  });
  res.json({ status: true, message: "Projects fetched successfully", data: projects });
});

// ✅ Get single project by ID
exports.getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findOne({
    where: { id },
    include: [{ model: User, attributes: ["id", "name", "email"] }],
  });
  if (!project)
    return res.status(404).json({ status: false, message: "Project not found" });

  res.json({ status: true, message: "Project fetched successfully", data: project });
});

// ✅ Get projects by user ID
exports.getProjectsByUserId = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const projects = await Project.findAll({
    where: { user_id },
  });
  res.json({ status: true, message: "Projects fetched successfully", data: projects });
});

// ✅ Change project status
exports.changeProjectStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const project = await Project.findByPk(id);
  if (!project)
    return res.status(404).json({ status: false, message: "Project not found" });

  project.status = status;
  await project.save();

  res.json({
    status: true,
    message: "Project status updated",
    data: project,
  });
});

// ✅ Delete project (optional: drop DB)
exports.deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findByPk(id);
  if (!project)
    return res.status(404).json({ status: false, message: "Project not found" });

  const transaction = await sequelize.transaction();
  try {
    await sequelize.query(`DROP DATABASE IF EXISTS \`${project.db_name}\`;`, {
      type: QueryTypes.RAW,
      transaction,
    });

    await project.destroy({ transaction });
    await transaction.commit();

    res.json({ status: true, message: "Project deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      status: false,
      message: "Failed to delete project",
      details: error.message,
    });
  }
});
