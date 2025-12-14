const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/adminAuthController");
const adminUserController = require("../controllers/adminUserController");
const adminRoomController = require("../controllers/adminRoomController");
const adminMetricsController = require("../controllers/adminMetricsController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// ==================== FR-030: Admin Login ====================
router.post("/login", adminAuthController.login);

// ==================== Apply Auth + Role Middleware ====================
// Tất cả routes dưới đây yêu cầu đăng nhập và role ADMIN
router.use(authMiddleware.verifyToken);
router.use(roleMiddleware.checkRole(["ADMIN"]));

// ==================== FR-031: User Management ====================
router.get("/users", adminUserController.getAllUsers);
router.get("/users/:id", adminUserController.getUserById);
router.patch("/users/:id/status", adminUserController.updateUserStatus);
router.delete("/users/:id", adminUserController.deleteUser);

// ==================== FR-032: Room Management ====================
router.get("/rooms", adminRoomController.getAllRooms);
router.get("/rooms/:id", adminRoomController.getRoomById);
router.delete("/rooms/:id", adminRoomController.deleteRoom);

// ==================== FR-033: Dashboard Metrics ====================
router.get("/metrics/overview", adminMetricsController.getMetricsOverview);
router.get("/metrics/messages-by-date", adminMetricsController.getMessagesByDate);

module.exports = router;
