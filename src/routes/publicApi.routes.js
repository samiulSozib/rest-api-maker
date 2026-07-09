const express = require("express");
const router = express.Router();
const publicApiCtrl = require("../controllers/publicApi.controller");
const asyncHandler = require("../middlewares/asyncHandler");
const verifyApiToken = require("../middlewares/verifyApiToken");

/*
  All routes require:
    - x-api-key header (or Authorization: Bearer <token>)
    - :projectId  — UUID of the user's project
    - :tableName  — name of the table within that project

  GET    /:projectId/:tableName/rows        — List rows (paginated)
  GET    /:projectId/:tableName/rows/:id    — Get single row by PK
  POST   /:projectId/:tableName/rows        — Create a row
  PUT    /:projectId/:tableName/rows/:id    — Update a row by PK
  DELETE /:projectId/:tableName/rows/:id    — Delete a row by PK
*/

const resolveAndAuth = [verifyApiToken, publicApiCtrl.resolveContext];

router.get("/:projectId/:tableName/rows", ...resolveAndAuth, asyncHandler(publicApiCtrl.listRows));
router.get("/:projectId/:tableName/rows/:id", ...resolveAndAuth, asyncHandler(publicApiCtrl.getRow));
router.post("/:projectId/:tableName/rows", ...resolveAndAuth, asyncHandler(publicApiCtrl.createRow));
router.put("/:projectId/:tableName/rows/:id", ...resolveAndAuth, asyncHandler(publicApiCtrl.updateRow));
router.delete("/:projectId/:tableName/rows/:id", ...resolveAndAuth, asyncHandler(publicApiCtrl.deleteRow));

module.exports = router;
