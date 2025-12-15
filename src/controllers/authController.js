const authService = require("../services/authService");
const ApiResponse = require("../utils/apiResponse");
const googleConfig = require("../configs/google");
const cookieUtils = require("../utils/cookieUtils");

class authController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return ApiResponse.error(res, 'Email và password là bắt buộc', 400);
      }

      const result = await authService.login(email, password);
      
      cookieUtils.setAuthCookies(res, result.accessToken, result.refreshToken);

      return ApiResponse.success(res, 'Đăng nhập thành công', {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,  // Trả về refreshToken
        user: result.user
      });
    } catch (error) {
      return ApiResponse.error(res, error.message, 401);
    }
  }

  async logout(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await authService.logout(userId);
      
      cookieUtils.clearAuthCookies(res);
      
      return ApiResponse.success(res, 'Đăng xuất thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async refreshToken(req, res) {
    try {
      // Lấy refreshToken từ cookie thay vì body
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return ApiResponse.error(res, 'Refresh token không tồn tại', 401);
      }

      const result = await authService.refreshToken(refreshToken);
      
      // Trả về accessToken mới
      return ApiResponse.success(res, 'Làm mới token thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 401);
    }
  }

  googleAuth(req, res, next) {
    const passport = googleConfig.getPassport();
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      session: false 
    })(req, res, next);
  }

  async googleCallback(req, res, next) {
    const passport = googleConfig.getPassport();
    
    passport.authenticate('google', { session: false }, async (err, user) => {
      try {
        const googleData = user;
        
        if (err || !googleData) {
          return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?error=oauth_failed`);
        }

        const result = await authService.loginWithGoogle(googleData);

        if (!process.env.FRONTEND_URL) {
          throw new Error("FRONTEND_URL is not set in environment variables");
        }

        cookieUtils.setAuthCookies(res, result.accessToken, result.refreshToken);

        return res.redirect(`${process.env.FRONTEND_URL}/oauth-success`);
      } catch (error) {
        console.error("[googleCallback] ERROR:", error);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?error=oauth_failed`);
      }
    })(req, res, next);
  }
}


module.exports = new authController();