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

      return ApiResponse.success(res, 'Đăng xuất thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async refreshToken(req, res) {
    try {
      // Lấy refreshToken từ body/header (không dùng cookie vì cross-origin)
      const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];

      console.log('[refreshToken] Request:', {
        hasBodyToken: !!req.body.refreshToken,
        hasHeaderToken: !!req.headers['x-refresh-token'],
        token: refreshToken ? refreshToken.substring(0, 20) + '...' : 'none'
      });

      if (!refreshToken) {
        return ApiResponse.error(res, 'Refresh token không tồn tại', 401);
      }

      const result = await authService.refreshToken(refreshToken);

      // Trả về accessToken mới
      return ApiResponse.success(res, 'Làm mới token thành công', result);
    } catch (error) {
      console.error('[refreshToken] Error:', error.message);
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

        console.log('[googleCallback] Start:', {
          hasError: !!err,
          hasUser: !!googleData,
          email: googleData?.email
        });

        if (err || !googleData) {
          console.error('[googleCallback] Auth failed:', err);
          return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?error=oauth_failed`);
        }

        const result = await authService.loginWithGoogle(googleData);

        console.log('[googleCallback] Login success:', {
          userId: result.user.id,
          email: result.user.email,
          hasAccessToken: !!result.accessToken,
          hasRefreshToken: !!result.refreshToken
        });

        if (!process.env.FRONTEND_URL) {
          throw new Error("FRONTEND_URL is not set in environment variables");
        }

        // Clean FRONTEND_URL (remove trailing/leading spaces and slashes)
        const frontendUrl = process.env.FRONTEND_URL.trim().replace(/\/$/, '');

        // Trả token qua URL params (work cho localhost)
        const params = new URLSearchParams({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: JSON.stringify(result.user)
        });

        const redirectUrl = `${frontendUrl}/oauth-success?${params.toString()}`;
        console.log('[googleCallback] Redirecting to:', redirectUrl.substring(0, 100) + '...');

        // Redirect về frontend với tokens
        return res.redirect(redirectUrl);
      } catch (error) {
        console.error("[googleCallback] ERROR:", error);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?error=oauth_failed`);
      }
    })(req, res, next);
  }
}


module.exports = new authController();