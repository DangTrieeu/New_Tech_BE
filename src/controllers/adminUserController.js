const adminService = require("../services/adminService");
const ApiResponse = require("../utils/apiResponse");

class AdminUserController {
  // FR-031: Get all users
  async getAllUsers(req, res) {
    try {
      const result = await adminService.getAllUsers();
      return ApiResponse.success(res, "Lấy danh sách users thành công", result);
    } catch (error) {
      console.error("Get all users error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // FR-031: Get user by ID with details
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const result = await adminService.getUserById(id);
      return ApiResponse.success(res, "Lấy thông tin user thành công", result);
    } catch (error) {
      console.error("Get user by ID error:", error);
      const statusCode = error.message.includes("không tồn tại") ? 404 : 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  // FR-031: Update user status (lock/unlock)
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await adminService.updateUserStatus(id, status);
      return ApiResponse.success(res, "Cập nhật status thành công", { user: result });
    } catch (error) {
      console.error("Update user status error:", error);
      const statusCode = error.message.includes("không hợp lệ") ? 400 : error.message.includes("không tồn tại") ? 404 : 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  // FR-031: Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await adminService.deleteUser(id);
      return ApiResponse.success(res, "Xóa user thành công", result);
    } catch (error) {
      console.error("Delete user error:", error);
      const statusCode = error.message.includes("không tồn tại") ? 404 : error.message.includes("admin") ? 403 : 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }
}

module.exports = new AdminUserController();
