const authService = require("../services/authService");
const ApiResponse = require("../utils/apiResponse");

class authController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return ApiResponse.error(res, 'Email và password là bắt buộc', 400);
      }

      const result = await authService.login(email, password);
      return ApiResponse.success(res, 'Đăng nhập thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 401);
    }
  }

  async logout(req, res) {
    try {
      const userId = req.user.id; // Lấy từ middleware authentication
      
      const result = await authService.logout(userId);
      return ApiResponse.success(res, 'Đăng xuất thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return ApiResponse.error(res, 'Refresh token là bắt buộc', 400);
      }

      const result = await authService.refreshToken(refreshToken);
      return ApiResponse.success(res, 'Làm mới token thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 401);
    }
  }
}


module.exports = new authController();