const adminService = require("../services/adminService");
const ApiResponse = require("../utils/apiResponse");

class AdminRoomController {
  // FR-032: Get all rooms
  async getAllRooms(req, res) {
    try {
      const { page, limit, sortBy, sortOrder, search } = req.query;
      
      const result = await adminService.getAllRooms({
        page,
        limit,
        sortBy,
        sortOrder,
        search
      });
      return ApiResponse.success(res, "Lấy danh sách rooms thành công", result);
    } catch (error) {
      console.error("Get all rooms error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // FR-032: Get room by ID with members
  async getRoomById(req, res) {
    try {
      const { id } = req.params;
      const result = await adminService.getRoomById(id);
      return ApiResponse.success(res, "Lấy thông tin room thành công", result);
    } catch (error) {
      console.error("Get room by ID error:", error);
      const statusCode = error.message.includes("không tồn tại") ? 404 : 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  // FR-032: Delete room
  async deleteRoom(req, res) {
    try {
      const { id } = req.params;
      const result = await adminService.deleteRoom(id);
      return ApiResponse.success(res, "Xóa room thành công", result);
    } catch (error) {
      console.error("Delete room error:", error);
      const statusCode = error.message.includes("không tồn tại") ? 404 : 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }
}

module.exports = new AdminRoomController();
