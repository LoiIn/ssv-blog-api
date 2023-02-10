const express = require("express");
const authController = require("./../controllers/authController");
const commentController = require("./../controllers/commentController");

const router = express.Router();

router.get(
  "/",
  commentController.setConditions,
  commentController.filterComments
);

router.get("/:id", commentController.getComment);
/**
 * login middleware
 */
router.use(authController.routeProtect);

router.use(authController.setPermisson("super-admin"));
router.get(
  "/",
  commentController.setConditions,
  commentController.filterComments
);

module.exports = router;
