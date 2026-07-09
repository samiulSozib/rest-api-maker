const { ProjectTable, Project, PackagePlan, Purchase, sequelize } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const { Op } = require("sequelize");
const { runSQLQuery } = require("../utils/cpanel");

const ALLOWED_DATA_TYPES = [
  "INT", "TINYINT", "SMALLINT", "MEDIUMINT", "BIGINT",
  "VARCHAR", "CHAR", "TEXT", "TINYTEXT", "MEDIUMTEXT", "LONGTEXT",
  "DECIMAL", "FLOAT", "DOUBLE",
  "DATE", "DATETIME", "TIMESTAMP", "TIME", "YEAR",
  "BOOLEAN", "BLOB", "MEDIUMBLOB", "LONGBLOB",
  "JSON", "ENUM"
];

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, "");
}

function validateSchemaColumns(schemaArray) {
  if (!Array.isArray(schemaArray) || schemaArray.length === 0) {
    return "schema_json must be a non-empty array";
  }
  for (const col of schemaArray) {
    if (!col.name || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col.name)) {
      return `Invalid column name: "${col.name}"`;
    }
    if (!col.data_type || !ALLOWED_DATA_TYPES.includes(col.data_type.toUpperCase())) {
      return `Invalid or disallowed data type: "${col.data_type}"`;
    }
    if (col.default_value && typeof col.default_value === "string" && /['";\\]/.test(col.default_value)) {
      return `Invalid characters in default value for column "${col.name}"`;
    }
  }
  return null;
}

exports.createProjectTable = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { project_id, table_name, schema_json, api_endpoints } = req.body;

  if (!table_name || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table_name)) {
    return res.status(400).json({
      status: false,
      message: "Invalid table name. Use only letters, numbers, and underscores.",
    });
  }

  const schemaValidationError = validateSchemaColumns(schema_json);
  if (schemaValidationError) {
    return res.status(400).json({
      status: false,
      message: schemaValidationError,
    });
  }

  const project = await Project.findOne({
    where: { id: project_id, user_id: userId },
  });

  if (!project) {
    return res.status(404).json({
      status: false,
      message: "Project not found",
    });
  }

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
      message: "No active purchase found for this project's package plan",
    });
  }

  if (project.total_table_limit && project.total_created_table >= project.total_table_limit) {
    return res.status(403).json({
      status: false,
      message: "Table limit reached for this package",
    });
  }

  const transaction = await sequelize.transaction();
  try {
    let schemaArray = schema_json;
    if (typeof schema_json === "string") {
      try {
        schemaArray = JSON.parse(schema_json);
      } catch (e) {
        return res.status(400).json({
          status: false,
          message: "Invalid schema_json JSON format",
        });
      }
    }

    const sanitizedTableName = sanitizeName(table_name);
    const columns = schemaArray
      .map((col) => {
        const name = sanitizeName(col.name);
        let sql = `\`${name}\` ${col.data_type.toUpperCase()}`;
        if (col.max_length) sql += `(${col.max_length})`;
        if (!col.is_nullable) sql += " NOT NULL";
        if (col.default_value) sql += ` DEFAULT '${String(col.default_value).replace(/'/g, "\\'")}'`;
        if (col.is_unique) sql += " UNIQUE";
        if (col.is_primary_key) sql += " PRIMARY KEY";
        return sql;
      })
      .join(", ");

    const createTableSQL = `CREATE TABLE \`${sanitizedTableName}\` (${columns});`;
    await runSQLQuery(project.db_name, project.db_user, project.db_password, createTableSQL);

    const projectTable = await ProjectTable.create(
      {
        project_id,
        table_name: sanitizedTableName,
        schema_json,
        api_endpoints
      },
      { transaction }
    );

    const total_tables_created = project.total_created_table + 1;
    await Project.update(
      { total_created_table: total_tables_created },
      { where: { id: project_id }, transaction }
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
      details: error,
    });
  }
});

exports.updateProjectTable = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { table_name, schema_json, api_endpoints } = req.body;

  const projectTable = await ProjectTable.findOne({
    include: [
      {
        model: Project,
        where: { user_id: userId },
        required: true,
      }
    ],
    where: { id }
  });

  if (!projectTable) {
    return res.status(404).json({
      status: false,
      message: "Project table not found",
    });
  }

  const updateData = {};
  if (table_name !== undefined) updateData.table_name = table_name;
  if (schema_json !== undefined) updateData.schema_json = schema_json;
  if (api_endpoints !== undefined) updateData.api_endpoints = api_endpoints;

  await projectTable.update(updateData);

  res.json({
    status: true,
    message: "Project table updated successfully",
    data: projectTable,
  });
});

exports.deleteProjectTable = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

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
      details: error.message,
    });
  }
});

exports.getProjectTableById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const projectTable = await ProjectTable.findOne({
    include: [
      {
        model: Project,
        where: { user_id: userId },
        required: true,
      }
    ],
    where: { id }
  });

  if (!projectTable) {
    return res.status(404).json({
      status: false,
      message: "Project table not found",
    });
  }

  res.json({
    status: true,
    message: "Project table fetched successfully",
    data: projectTable,
  });
});

exports.getProjectTables = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { project_id } = req.params;

  const {
    page = 1,
    limit = 10,
    search = "",
  } = req.query;

  const offset = (page - 1) * limit;

  const project = await Project.findOne({
    where: { id: project_id, user_id: userId },
  });

  if (!project) {
    return res.status(404).json({
      status: false,
      message: "Project not found",
    });
  }

  let whereCondition = { project_id };

  if (search.trim() !== "") {
    whereCondition.table_name = { [Op.like]: `%${search}%` };
  }

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

exports.getAllUserProjectTables = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const {
    page = 1,
    limit = 10,
    search = "",
    project_id,
  } = req.query;

  const offset = (page - 1) * limit;

  let tableWhereCondition = {};

  if (search.trim() !== "") {
    tableWhereCondition.table_name = { [Op.like]: `%${search}%` };
  }

  if (project_id) {
    tableWhereCondition.project_id = project_id;
  }

  const { rows, count } = await ProjectTable.findAndCountAll({
    where: tableWhereCondition,
    include: [
      {
        model: Project,
        where: { user_id: userId },
        required: true,
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
