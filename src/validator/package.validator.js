const { body } = require("express-validator");

const PACKAGE_STATUS = ["active", "inactive", "archived"];

// ✅ Create Package Validator
exports.createPackageValidator = [
  body("name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Package name must be at least 3 characters long"),

  

  body("status")
    .optional()
    .isIn(PACKAGE_STATUS)
    .withMessage(`Status must be one of: ${PACKAGE_STATUS.join(", ")}`),

  body("max_projects")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max projects must be at least 1"),

  body("max_tables_per_project")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max tables per project must be at least 1"),

  body("features")
    .optional()
];


// ✅ Update Package Validator
exports.updatePackageValidator = [
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Package name must be at least 3 characters long"),

  

  body("status")
    .optional()
    .isIn(PACKAGE_STATUS)
    .withMessage(`Status must be one of: ${PACKAGE_STATUS.join(", ")}`),

  body("max_projects")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max projects must be at least 1"),

  body("max_tables_per_project")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max tables per project must be at least 1"),

  body("features")
    .optional()
    ,

  body("sell_count")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sell count must be a non-negative integer"),
];
