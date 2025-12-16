const userService = require("../services/userService");
const ApiResponse = require("../utils/apiResponse");

class userController {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return ApiResponse.error(res, 'Email và password là bắt buộc', 400);
      }

      const result = await userService.register({ name, email, password });
      return ApiResponse.success(res, 'Đăng ký thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const result = await userService.getProfile(userId);
      return ApiResponse.success(res, 'Lấy thông tin thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, avatar_url } = req.body;

      const result = await userService.updateProfile(userId, { name, avatar_url });
      return ApiResponse.success(res, 'Cập nhật thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async searchUsers(req, res) {
    try {
      const { q } = req.query; // query string: ?q=searchterm
      const currentUserId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;

      if (!q || q.trim() === '') {
        return ApiResponse.success(res, 'Kết quả tìm kiếm', []);
      }

      const result = await userService.searchUsers(q.trim(), currentUserId, limit);
      return ApiResponse.success(res, 'Tìm kiếm thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new userController();
