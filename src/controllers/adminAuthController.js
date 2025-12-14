const { User } = require("../models");
const ApiResponse = require("../utils/apiResponse");
const jwt = require("jsonwebtoken");

class AdminAuthController {
  // POST /admin/login - Admin Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ApiResponse.error(res, "Email và password là bắt buộc", 400);
      }

      // Tìm user với role ADMIN
      const user = await User.findOne({
        where: { email, role: "ADMIN" },
        attributes: ["id", "name", "email", "role", "status"],
      });

      if (!user) {
        return ApiResponse.error(res, "Email hoặc mật khẩu không đúng", 401);
      }

      // TODO: Validate password với bcrypt (tạm thời skip để test)
      // const isValidPassword = await bcrypt.compare(password, user.password);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      return ApiResponse.success(res, "Đăng nhập admin thành công", {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
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
