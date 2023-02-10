const express = require("express");
const authController = require("./../controllers/authController");
const dashboardController = require("./../controllers/dashboardController");

const router = express.Router();

// login middleware
router.use(authController.routeProtect);

router.get("/posts/count/:agent", dashboardController.countPostByAgent);
router.get("/posts/rank/:type", dashboardController.rankPostByReaction);

module.exports = router;
