const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Public route
router.post("/register", userController.register); // Đăng ký


// Protected routes
router.use(authMiddleware.verifyToken);
router.get("/search", userController.searchUsers); // Tìm kiếm người dùng
router.get("/profile", userController.getProfile); // Lấy thông tin
router.put("/profile", userController.updateProfile); // Cập nhật thông tin

module.exports = router;
