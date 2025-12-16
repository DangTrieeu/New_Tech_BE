const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const authMiddleware = require("../middlewares/authMiddleware");

// Protected routes
// Tất cả các route đều cần đăng nhập
router.use(authMiddleware.verifyToken);

// Lấy danh sách phòng của user hiện tại
router.get("/", roomController.getUserRooms);

// Tạo hoặc lấy phòng chat 1-1
router.post("/private", roomController.getPrivateRoom);

// Tạo nhóm chat
router.post("/group", roomController.createGroupRoom);

// Lấy chi tiết phòng
router.get("/:id", roomController.getRoomDetail);

// Cập nhật phòng (tên)
router.put("/:id", roomController.updateRoom);

// Xóa phòng
router.delete("/:id", roomController.deleteRoom);

// Thêm thành viên vào nhóm
router.post("/:id/participants", roomController.addParticipants);

// Xóa thành viên khỏi nhóm (hoặc rời nhóm)
router.delete("/:id/participants", roomController.removeParticipant);

module.exports = router;
