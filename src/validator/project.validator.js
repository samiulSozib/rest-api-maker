const { body } = require("express-validator");

exports.createProjectValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Project name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),

  body("package_plan_id")
    .notEmpty()
    .withMessage("Package plan ID is required")
    .isUUID()
    .withMessage("Invalid package plan ID format"),
];

exports.createTableValidator = [
  body("project_id")
    .notEmpty()
    .withMessage("Project ID is required")
    .isUUID()
    .withMessage("Invalid project ID format"),

  body("table_name")
    .trim()
    .notEmpty()
    .withMessage("Table name is required")
    .matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    .withMessage("Table name must start with a letter or underscore and contain only letters, numbers, and underscores"),

  body("schema_json")
    .notEmpty()
    .withMessage("Schema definition is required"),
];

exports.buyPackageValidator = [
  body("package_plan_id")
    .notEmpty()
    .withMessage("Package plan ID is required")
    .isUUID()
    .withMessage("Invalid package plan ID format"),
];
