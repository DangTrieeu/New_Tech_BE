const jwt = require("jsonwebtoken");
require("dotenv").config();

class AuthMiddleware {
  verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      console.log('[AuthMiddleware] Request:', {
        method: req.method,
        path: req.path,
        hasAuthHeader: !!authHeader,
        authHeader: authHeader ? authHeader.substring(0, 20) + '...' : 'none'
      });

      if (!authHeader) {
        console.log('[AuthMiddleware] Missing Authorization header');
        return res.status(401).json({
          status: "error",
          message: "Token không được cung cấp. Header Authorization bị thiếu.",
        });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        console.log('[AuthMiddleware] Invalid Authorization format');
        return res.status(401).json({
          status: "error",
          message: "Token không được cung cấp. Format: Bearer <token>",
        });
      }

      if (!process.env.JWT_SECRET) {
        console.error('[AuthMiddleware] JWT_SECRET is not set!');
        return res.status(500).json({
          status: "error",
          message: "Server configuration error",
        });
      }

      console.log('[AuthMiddleware] Verifying with JWT_SECRET:', process.env.JWT_SECRET);
      console.log('[AuthMiddleware] Full token:', token.substring(0, 50) + '...' + token.substring(token.length - 20));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // gắn thông tin user vào req để dùng tiếp

      console.log('[AuthMiddleware] Token verified:', {
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role
      });

      next();
    } catch (error) {
      console.error('[AuthMiddleware] Verify error:', {
        name: error.name,
        message: error.message
      });

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: "error",
          message: "Token đã hết hạn. Vui lòng đăng nhập lại hoặc refresh token.",
          code: "TOKEN_EXPIRED"
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: "error",
          message: "Token không hợp lệ",
          code: "INVALID_TOKEN"
        });
      }

      return res.status(401).json({
        status: "error",
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

  }

  // Optional token - không bắt buộc, chỉ parse nếu có
  optionalToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // gắn user nếu token hợp lệ
      }
      // Nếu không có token hoặc token invalid -> vẫn next (req.user = undefined)
      next();
    } catch (error) {
      // Token invalid nhưng vẫn cho qua (public route)
      next();
    }
  }
}

module.exports = new AuthMiddleware();