const { Project, ProjectTable, Purchase } = require("../models");
const asyncHandler = require("../middlewares/asyncHandler");
const { runSQLQuery } = require("../utils/cpanel");

// ─── Helpers ───────────────────────────────────────────

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, "");
}

function findPrimaryKeyColumn(schemaArray) {
  const pk = schemaArray.find((c) => c.is_primary_key);
  return pk ? pk.name : "id";
}

function buildParamPlaceholders(arr) {
  return arr.map(() => "?").join(", ");
}

// ─── Middleware: resolve project + table context ───────

exports.resolveContext = asyncHandler(async (req, res, next) => {
  const userId = req.auth.userId;
  const { projectId, tableName } = req.params;

  const project = await Project.findOne({
    where: { id: projectId, user_id: userId },
  });

  if (!project) {
    return res.status(404).json({ status: false, message: "Project not found" });
  }

  const activePurchase = await Purchase.findOne({
    where: {
      user_id: userId,
      package_plan_id: project.package_plan_id,
      status: "active",
    },
  });

  if (!activePurchase) {
    return res.status(403).json({ status: false, message: "No active purchase for this project" });
  }

  const projectTable = await ProjectTable.findOne({
    where: { project_id: projectId, table_name: tableName },
  });

  if (!projectTable) {
    return res.status(404).json({ status: false, message: "Table not found in this project" });
  }

  let schemaArray = projectTable.schema_json;
  if (typeof schemaArray === "string") {
    try {
      schemaArray = JSON.parse(schemaArray);
    } catch {
      return res.status(500).json({ status: false, message: "Invalid schema definition on server" });
    }
  }
  if (!Array.isArray(schemaArray)) {
    return res.status(500).json({ status: false, message: "Invalid schema definition on server" });
  }

  const sanitizedTable = sanitizeName(projectTable.table_name);
  const pkColumn = findPrimaryKeyColumn(schemaArray);

  req.dbContext = {
    project,
    projectTable,
    schemaArray,
    dbName: project.db_name,
    dbUser: project.db_user,
    dbPassword: project.db_password,
    tableName: sanitizedTable,
    pkColumn,
  };

  next();
});

// ─── Helpers for validation ───────────────────────────

function columnFromSchema(schemaArray, name) {
  return schemaArray.find((c) => c.name === name);
}

const NUMERIC_TYPES = new Set([
  "INT", "TINYINT", "SMALLINT", "MEDIUMINT", "BIGINT",
  "DECIMAL", "FLOAT", "DOUBLE",
]);

const STRING_TYPES = new Set([
  "VARCHAR", "CHAR", "TEXT", "TINYTEXT", "MEDIUMTEXT", "LONGTEXT",
  "DATE", "DATETIME", "TIMESTAMP", "TIME", "YEAR",
  "ENUM",
]);

function validateValue(col, value) {
  const type = (col.data_type || "").toUpperCase();

  if (value === null || value === undefined) {
    if (col.is_nullable === false && !col.default_value && col.name !== "id") {
      return `"${col.name}" is required`;
    }
    return null;
  }

  if (NUMERIC_TYPES.has(type)) {
    if (typeof value === "boolean") return `"${col.name}" must be a number, got boolean`;
    if (typeof value === "string" && value.trim() === "") return `"${col.name}" must be a number`;
    const num = Number(value);
    if (isNaN(num)) return `"${col.name}" must be a valid number`;
  } else if (type === "BOOLEAN") {
    if (typeof value !== "boolean" && value !== 0 && value !== 1 && value !== "0" && value !== "1") {
      return `"${col.name}" must be a boolean`;
    }
  } else if (type === "JSON") {
    if (typeof value !== "object" || value === null) {
      return `"${col.name}" must be a JSON object or array`;
    }
  } else if (STRING_TYPES.has(type)) {
    if (typeof value !== "string") return `"${col.name}" must be a string`;
    if (col.max_length && value.length > Number(col.max_length)) {
      return `"${col.name}" exceeds max length of ${col.max_length}`;
    }
  }

  return null;
}

function validateBody(schemaArray, body, forUpdate) {
  const errors = [];

  for (const col of schemaArray) {
    if (col.name === findPrimaryKeyColumn(schemaArray) && col.is_primary_key) continue;

    const value = body[col.name];

    if (forUpdate && value === undefined) continue;

    const err = validateValue(col, value);
    if (err) errors.push(err);
  }

  const schemaNames = new Set(schemaArray.map((c) => c.name));
  for (const key of Object.keys(body)) {
    if (!schemaNames.has(key)) {
      errors.push(`Unknown column: "${key}"`);
    }
  }

  return errors.length > 0 ? errors : null;
}

function buildColumnsList(schemaArray) {
  return schemaArray
    .filter((c) => !(c.is_primary_key && c.name === findPrimaryKeyColumn(schemaArray)))
    .map((c) => `\`${sanitizeName(c.name)}\``);
}

// ─── CRUD Handlers ────────────────────────────────────

exports.listRows = asyncHandler(async (req, res) => {
  const { dbName, dbUser, dbPassword, tableName } = req.dbContext;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const offset = (page - 1) * limit;
  const orderBy = req.query.order_by || "id";
  const orderDir = req.query.order_dir === "desc" ? "DESC" : "ASC";

  const countSql = `SELECT COUNT(*) AS total FROM \`${tableName}\``;
  const countResult = await runSQLQuery(dbName, dbUser, dbPassword, countSql);
  const total = countResult[0]?.total || 0;

  const selectSql = `SELECT * FROM \`${tableName}\` ORDER BY \`${sanitizeName(orderBy)}\` ${orderDir} LIMIT ? OFFSET ?`;
  const rows = await runSQLQuery(dbName, dbUser, dbPassword, selectSql, [limit, offset]);

  res.json({
    status: true,
    message: "Rows fetched successfully",
    data: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

exports.getRow = asyncHandler(async (req, res) => {
  const { dbName, dbUser, dbPassword, tableName, pkColumn } = req.dbContext;
  const rowId = req.params.id;

  const sql = `SELECT * FROM \`${tableName}\` WHERE \`${pkColumn}\` = ? LIMIT 1`;
  const rows = await runSQLQuery(dbName, dbUser, dbPassword, sql, [rowId]);

  if (!rows || rows.length === 0) {
    return res.status(404).json({ status: false, message: "Row not found" });
  }

  res.json({ status: true, message: "Row fetched successfully", data: rows[0] });
});

exports.createRow = asyncHandler(async (req, res) => {
  const { dbName, dbUser, dbPassword, tableName, schemaArray, pkColumn } = req.dbContext;

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ status: false, message: "Request body is required" });
  }

  const errors = validateBody(schemaArray, req.body, false);
  if (errors) {
    return res.status(400).json({ status: false, message: "Validation failed", errors });
  }

  const columns = buildColumnsList(schemaArray);
  const values = columns.map((col) => {
    const raw = col.replace(/`/g, "");
    return req.body[raw] !== undefined ? req.body[raw] : null;
  });
  const placeholders = buildParamPlaceholders(values);

  const insertSql = `INSERT INTO \`${tableName}\` (${columns.join(", ")}) VALUES (${placeholders})`;
  const result = await runSQLQuery(dbName, dbUser, dbPassword, insertSql, values);

  const insertId = result.insertId;
  let newRow = null;
  if (insertId !== undefined) {
    const fetchSql = `SELECT * FROM \`${tableName}\` WHERE \`${pkColumn}\` = ? LIMIT 1`;
    const rows = await runSQLQuery(dbName, dbUser, dbPassword, fetchSql, [insertId]);
    newRow = rows?.[0] || null;
  }

  res.status(201).json({ status: true, message: "Row created successfully", data: newRow });
});

exports.updateRow = asyncHandler(async (req, res) => {
  const { dbName, dbUser, dbPassword, tableName, schemaArray, pkColumn } = req.dbContext;
  const rowId = req.params.id;

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ status: false, message: "Request body is required" });
  }

  const errors = validateBody(schemaArray, req.body, true);
  if (errors) {
    return res.status(400).json({ status: false, message: "Validation failed", errors });
  }

  const setClauses = [];
  const values = [];

  for (const col of schemaArray) {
    if (col.name === pkColumn) continue;
    if (req.body[col.name] === undefined) continue;

    setClauses.push(`\`${sanitizeName(col.name)}\` = ?`);
    values.push(req.body[col.name]);
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ status: false, message: "No valid columns to update" });
  }

  values.push(rowId);
  const updateSql = `UPDATE \`${tableName}\` SET ${setClauses.join(", ")} WHERE \`${pkColumn}\` = ?`;
  await runSQLQuery(dbName, dbUser, dbPassword, updateSql, values);

  const fetchSql = `SELECT * FROM \`${tableName}\` WHERE \`${pkColumn}\` = ? LIMIT 1`;
  const rows = await runSQLQuery(dbName, dbUser, dbPassword, fetchSql, [rowId]);

  res.json({ status: true, message: "Row updated successfully", data: rows?.[0] || null });
});

exports.deleteRow = asyncHandler(async (req, res) => {
  const { dbName, dbUser, dbPassword, tableName, pkColumn } = req.dbContext;
  const rowId = req.params.id;

  const deleteSql = `DELETE FROM \`${tableName}\` WHERE \`${pkColumn}\` = ?`;
  const result = await runSQLQuery(dbName, dbUser, dbPassword, deleteSql, [rowId]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ status: false, message: "Row not found" });
  }

  res.json({ status: true, message: "Row deleted successfully" });
});
