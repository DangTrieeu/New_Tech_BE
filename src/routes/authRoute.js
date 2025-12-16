const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
// cach su dung middleware
// router.use(authMiddleware.verifyToken);
// router.use(roleMiddleware.checkRole(["ADMIN"]));
router.post("/", authController.login); // login
router.get("/google", authController.googleAuth); // Google OAuth - redirect to Google
router.get("/google/callback", authController.googleCallback); // Google OAuth callback
router.post("/logout", authMiddleware.verifyToken, authController.logout); // logout
router.post("/refresh", authController.refreshToken); // refresh access token
 
module.exports = router;