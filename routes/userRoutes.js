const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");

const router = express.Router();

/**
 * common route
 */
router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/password-forgot", authController.forgotPassword);
router.patch("/password-reset/:token", authController.resetPassword);
router.get("/logout", authController.logout);
router.get("/:id", userController.otherInformation);

/**
 * login middleware
 */
router.use(authController.routeProtect);

// information
router
  .route("/me/information")
  .get(userController.myInformation, userController.getUser)
  .patch(
    userController.uploadAvatar,
    userController.resizeAvatar,
    userController.updateMyInformation
  );
router.patch("/password-update", authController.updatePasword);

// super-admin: user management
router.use(authController.setPermisson("super-admin"));
router.post("/", userController.createUser);
router.delete("/:id", userController.deleteUser);
router.patch("/change-role/:id", userController.changeRole);

router.get("/", userController.setConditions, userController.filterUsers);

module.exports = router;
