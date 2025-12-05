const { Project, User, sequelize, PackagePlan, Package, ProjectTable } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const { QueryTypes } = require("sequelize");

// ✅ Get all projects
exports.getAllProjects = asyncHandler(async (req, res) => {

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
    include:[
      {
        model:PackagePlan,
        include:[
          {
            model:Package
          }
        ]
      },
      {model:User}
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

// ✅ Get single project by ID
exports.getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findOne({
    where: { id },
    include: [{ model: User },{model:ProjectTable,attributes: ["id", "table_name"]},{model:PackagePlan,include:[{model:Package}]}],
  });
  if (!project)
    return res.status(404).json({ status: false, message: "Project not found" });

  res.json({ status: true, message: "Project fetched successfully", data: project });
});

// ✅ Get projects by user ID
exports.getProjectsByUserId = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const projects = await Project.findAll({
    include:[
      {
        model:User
      },
      {
        model:PackagePlan,
        include:[
          {
            model:Package
          }
        ]
      }
    ],
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
    });
  }
});
