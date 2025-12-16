const { User, Room, Message, sequelize } = require("../models");
const ApiResponse = require("../utils/apiResponse");

class AdminUserController {
  // FR-031: Get all users
  async getAllUsers(req, res) {
    try {
      const users = await sequelize.query(
        `SELECT 
          u.id, u.name, u.email, u.avatar_url, u.role, u.status, u.created_at,
          COUNT(DISTINCT ur.room_id) as totalRoomsJoined,
          COUNT(DISTINCT m.id) as totalMessagesSent
        FROM users u
        LEFT JOIN user_rooms ur ON u.id = ur.user_id
        LEFT JOIN messages m ON u.id = m.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC`,
        { type: sequelize.QueryTypes.SELECT }
      );

      return ApiResponse.success(res, "Lấy danh sách users thành công", {
        users,
        total: users.length,
      });
    } catch (error) {
      console.error("Get all users error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // FR-031: Get user by ID with details
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await sequelize.query(
        `SELECT 
          u.id, u.name, u.email, u.avatar_url, u.role, u.status, u.created_at,
          COUNT(DISTINCT ur.room_id) as totalRoomsJoined,
          COUNT(DISTINCT m.id) as totalMessagesSent
        FROM users u
        LEFT JOIN user_rooms ur ON u.id = ur.user_id
        LEFT JOIN messages m ON u.id = m.user_id
        WHERE u.id = ?
        GROUP BY u.id`,
        {
          replacements: [id],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!user || user.length === 0) {
        return ApiResponse.error(res, "User không tồn tại", 404);
      }

      // Get rooms joined
      const rooms = await sequelize.query(
        `SELECT r.id, r.name, r.type, r.created_at
        FROM rooms r
        INNER JOIN userroom ur ON r.id = ur.room_id
        WHERE ur.user_id = ?
        ORDER BY r.created_at DESC`,
        {
          replacements: [id],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return ApiResponse.success(res, "Lấy thông tin user thành công", {
        user: user[0],
        rooms,
      });
    } catch (error) {
      console.error("Get user by ID error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // FR-031: Update user status (lock/unlock)
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["ONLINE", "OFFLINE"].includes(status)) {
        return ApiResponse.error(res, "Status không hợp lệ", 400);
      }

      const user = await User.findByPk(id);
      if (!user) {
        return ApiResponse.error(res, "User không tồn tại", 404);
      }

      await user.update({ status });

      return ApiResponse.success(res, "Cập nhật status thành công", {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
        },
      });
    } catch (error) {
      console.error("Update user status error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // FR-031: Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return ApiResponse.error(res, "User không tồn tại", 404);
      }

      // Prevent deleting admin
      if (user.role === "ADMIN") {
        return ApiResponse.error(res, "Không thể xóa tài khoản admin", 403);
      }

      // Delete user (cascade delete will handle userroom và messages)
      await user.destroy();

      return ApiResponse.success(res, "Xóa user thành công", { deletedId: id });
    } catch (error) {
      console.error("Delete user error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new AdminUserController();
