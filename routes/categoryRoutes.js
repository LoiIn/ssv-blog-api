const express = require("express");
const authController = require("./../controllers/authController");
const categoryController = require("./../controllers/categoryController");

const router = express.Router();

/**
 * login middleware
 */
router.use(authController.routeProtect);

// super-admin: Category management
router.use(authController.setPermisson("super-admin", "admin"));
router
  .route("/")
  .get(categoryController.setConditions, categoryController.filterCategories)
  .post(categoryController.createCategory);

router
  .route("/:id")
  .get(categoryController.getCategory)
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
