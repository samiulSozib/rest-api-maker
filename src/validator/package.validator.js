const { body } = require("express-validator");

exports.createPackageValidator = [
  body("name").trim().isLength({ min: 3 }).withMessage("Package name required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
  body("duration_days").isInt({ gt: 0 }).withMessage("Duration must be positive integer"),
  body("max_projects").optional().isInt({ min: 1 }),
  body("max_tables_per_project").optional().isInt({ min: 1 }),
];

exports.updatePackageValidator = [
  body("name").optional().isLength({ min: 3 }),
  body("price").optional().isFloat({ gt: 0 }),
  body("duration_days").optional().isInt({ gt: 0 }),
  body("max_projects").optional().isInt({ min: 1 }),
  body("max_tables_per_project").optional().isInt({ min: 1 }),
];
