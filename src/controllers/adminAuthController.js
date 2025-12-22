const adminService = require("../services/adminService");
const ApiResponse = require("../utils/apiResponse");

class AdminAuthController {
  // FR-030: Admin Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await adminService.login(email, password);

      return ApiResponse.success(res, "Đăng nhập admin thành công", result);
    } catch (error) {
      console.error("Admin login error:", error);
      const statusCode = error.message.includes("không tồn tại") || error.message.includes("không đúng") ? 401 : 400;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }
}

module.exports = new AdminAuthController();
