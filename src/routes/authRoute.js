const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
// cach su dung middleware
// router.use(authMiddleware.verifyToken);
// router.use(roleMiddleware.checkRole(["ADMIN"]));
router.post("/", authController.login); // login
 
module.exports = router;