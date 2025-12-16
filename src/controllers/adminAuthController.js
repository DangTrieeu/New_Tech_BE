const { User } = require("../models");
const bcrypt = require("bcryptjs");
const JwtUtils = require("../utils/jwt");
const ApiResponse = require("../utils/apiResponse");

class AdminAuthController {
  // FR-030: Admin Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ApiResponse.error(res, "Email và password là bắt buộc", 400);
      }

      // Tìm user với role ADMIN
      const user = await User.findOne({ where: { email, role: "ADMIN" } });

      if (!user) {
        return ApiResponse.error(res, "Tài khoản admin không tồn tại", 401);
      }

      // Kiểm tra password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return ApiResponse.error(res, "Mật khẩu không đúng", 401);
      }

      // Tạo JWT tokens
      const accessToken = JwtUtils.signAccess({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = JwtUtils.signRefresh({ id: user.id });

      // Update token vào database
      await user.update({ token: refreshToken });

      return ApiResponse.success(res, "Đăng nhập admin thành công", {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Admin login error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new AdminAuthController();
