class RoleMiddleware {
  checkRole(allowedRoles = []) {
    return (req, res, next) => {
      const userRole = req.user?.role;

      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({
          status: "error",
          message: "Bạn không có quyền truy cập tài nguyên này",
        });
      }

      next();
    };
  }
}

module.exports = new RoleMiddleware();
