const { ProjectTable, Project, PackagePlan, Purchase, sequelize } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const { Op } = require("sequelize");

// ✅ Create new project table
exports.createProjectTable = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { project_id, table_name, schema_json, api_endpoints } = req.body;

  // Check if project exists and belongs to user
  const project = await Project.findOne({
    where: { id: project_id, user_id: userId },
    include: [
      {
        model: PackagePlan,
        where: { status: 'active' }, // Ensure package plan is active
        required: true
      }
    ]
  });

  if (!project) {
    return res.status(404).json({
      status: false,
      message: "Project not found or package plan is inactive",
      error: "Project not found or package plan is inactive",
    });
  }

  // Check if user has active purchase for this package plan
  const activePurchase = await Purchase.findOne({
    where: { 
      user_id: userId, 
      package_plan_id: project.package_plan_id,
      status: "active" 
    }
  });

  if (!activePurchase) {
    return res.status(403).json({
      status: false,
      message: "No active purchase found for this package plan",
      error: "No active purchase found for this package plan",
    });
  }


  // Assuming package plan has a table_limit field - you might need to add this
  if (project.total_table_limit && project.total_created_table >= project.total_table_limit) {
    return res.status(403).json({
      status: false,
      message: "Table limit reached for this package",
      error: "Table limit reached for this package",
    });
  }

  const transaction = await sequelize.transaction();
  try {
    // Create project table
    const projectTable = await ProjectTable.create(
      {
        project_id,
        table_name,
        schema_json,
        api_endpoints
      },
      { transaction }
    );

    // Update project table count table
    const total_tables_created = project.total_created_table + 1;
    await Project.update(
      { total_created_table:total_tables_created },
      {
        where: { id: project_id },
        transaction
      }
    );

    await transaction.commit();
    
    res.status(201).json({
      status: true,
      message: "Project table created successfully",
      data: projectTable,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      status: false,
      message: "Failed to create project table",
      error: "Failed to create project table",
      details: error.message,
    });
  }
});

// ✅ Edit project table
exports.updateProjectTable = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { table_name, schema_json, api_endpoints } = req.body;

  // Find project table and verify ownership through project
  const projectTable = await ProjectTable.findOne({
    include: [
      {
        model: Project,
        where: { user_id: userId },
        required: true,
        include: [
          {
            model: PackagePlan,
            where: { status: 'active' }, // Ensure package plan is active
            required: true
          }
        ]
      }
    ],
    where: { id }
  });

  if (!projectTable) {
    return res.status(404).json({
      status: false,
      message: "Project table not found or package plan is inactive",
      error: "Project table not found or package plan is inactive",
    });
  }

  await projectTable.update({ table_name, schema_json, api_endpoints });
  
  res.json({
    status: true,
    message: "Project table updated successfully",
    data: projectTable,
  });
});

// ✅ Delete project table
exports.deleteProjectTable = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  // Find project table and verify ownership through project
  const projectTable = await ProjectTable.findOne({
    include: [
      {
        model: Project,
        where: { user_id: userId },
        required: true
      }
    ],
    where: { id }
  });

  if (!projectTable) {
    return res.status(404).json({
      status: false,
      message: "Project table not found",
      error: "Project table not found",
    });
  }

  const transaction = await sequelize.transaction();
  try {
    await projectTable.destroy({ transaction });
    await transaction.commit();

    res.json({
      status: true,
      message: "Project table deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      status: false,
      message: "Failed to delete project table",
      error: "Failed to delete project table",
      details: error.message,
    });
  }
});

// ✅ Get single project table by ID
exports.getProjectTableById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const projectTable = await ProjectTable.findOne({
    include: [
      {
        model: Project,
        where: { user_id: userId },
        required: true,
        include: [
          {
            model: PackagePlan,
            where: { status: 'active' }
          }
        ]
      }
    ],
    where: { id }
  });

  if (!projectTable) {
    return res.status(404).json({
      status: false,
      message: "Project table not found or package plan is inactive",
      error: "Project table not found or package plan is inactive",
    });
  }

  res.json({
    status: true,
    message: "Project table fetched successfully",
    data: projectTable,
  });
});

// ✅ Get project tables by project
exports.getProjectTables = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { project_id } = req.params;

  // 🔹 Query params
  const {
    page = 1,
    limit = 10,
    search = "",
  } = req.query;

  const offset = (page - 1) * limit;

  // Verify project exists and belongs to user with active package plan
  const project = await Project.findOne({
    where: { id: project_id, user_id: userId },
    include: [
      {
        model: PackagePlan,
        where: { status: 'active' },
        required: true
      }
    ]
  });
 

  if (!project) {
    return res.status(404).json({
      status: false,
      message: "Project not found or package plan is inactive",
      error: "Project not found or package plan is inactive",
    });
  }

  // 🔹 Build WHERE conditions
  let whereCondition = {
    project_id,
  };

  // 🔍 Search by table name
  if (search.trim() !== "") {
    whereCondition.table_name = { [Op.like]: `%${search}%` };
  }

  // 🔹 Fetch project tables with pagination
  const { rows, count } = await ProjectTable.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: Project,
        attributes: ['id', 'name', 'status']
      }
    ],
    limit: parseInt(limit),
    offset,
    order: [["createdAt", "DESC"]]
  });

  res.json({
    status: true,
    message: "Project tables fetched successfully",
    data: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit)
    },
  });
});

// ✅ Get all tables for a user (across all projects)
exports.getAllUserProjectTables = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 🔹 Query params
  const {
    page = 1,
    limit = 10,
    search = "",
    project_id,
  } = req.query;

  const offset = (page - 1) * limit;

  // 🔹 Build WHERE conditions for ProjectTable
  let tableWhereCondition = {};

  // 🔍 Search by table name
  if (search.trim() !== "") {
    tableWhereCondition.table_name = { [Op.like]: `%${search}%` };
  }

  // 🔍 Filter by project
  if (project_id) {
    tableWhereCondition.project_id = project_id;
  }

  // 🔹 Fetch project tables with pagination
  const { rows, count } = await ProjectTable.findAndCountAll({
    where: tableWhereCondition,
    include: [
      {
        model: Project,
        where: { user_id: userId },
        required: true,
        include: [
          {
            model: PackagePlan,
            where: { status: 'active' },
            required: true
          }
        ]
      }
    ],
    limit: parseInt(limit),
    offset,
    order: [["createdAt", "DESC"]]
  });

  res.json({
    status: true,
    message: "Project tables fetched successfully",
    data: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit)
    },
  });
});