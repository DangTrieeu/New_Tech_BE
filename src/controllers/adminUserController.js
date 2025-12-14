const { User, Room, sequelize } = require("../models");
const ApiResponse = require("../utils/apiResponse");

class AdminUserController {
  // GET /admin/users - Lấy tất cả users với stats
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: {
          include: [
            // Count total rooms joined
            [
              sequelize.literal(`(
                SELECT COUNT(DISTINCT room_id)
                FROM userroom
                WHERE userroom.user_id = User.id
              )`),
              "totalRoomsJoined",
            ],
            // Count total messages sent
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM messages
                WHERE messages.user_id = User.id
              )`),
              "totalMessagesSent",
            ],
          ],
        },
        order: [["created_at", "DESC"]],
      });

      return ApiResponse.success(res, "Lấy danh sách users thành công", {
        count: users.length,
        users,
      });
    } catch (error) {
      console.error("Get all users error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // GET /admin/users/:id - Lấy chi tiết user
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(DISTINCT room_id)
                FROM userroom
                WHERE userroom.user_id = User.id
              )`),
              "totalRoomsJoined",
            ],
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM messages
                WHERE messages.user_id = User.id
              )`),
              "totalMessagesSent",
            ],
          ],
        },
        include: [
          {
            model: Room,
            as: "joined_rooms",
            attributes: ["id", "name", "type", "created_at"],
            through: { attributes: [] },
          },
        ],
      });

      if (!user) {
        return ApiResponse.error(res, "User không tồn tại", 404);
      }

      return ApiResponse.success(res, "Lấy thông tin user thành công", user);
    } catch (error) {
      console.error("Get user by ID error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // PATCH /admin/users/:id/status - Lock/Unlock user
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["ONLINE", "OFFLINE"].includes(status)) {
        return ApiResponse.error(
          res,
          'Status phải là "ONLINE" hoặc "OFFLINE"',
          400
        );
      }

      const user = await User.findByPk(id);
      if (!user) {
        return ApiResponse.error(res, "User không tồn tại", 404);
      }

      user.status = status;
      await user.save();

      return ApiResponse.success(
        res,
        `Cập nhật trạng thái user thành công`,
        user
      );
    } catch (error) {
      console.error("Update user status error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // DELETE /admin/users/:id - Xóa user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return ApiResponse.error(res, "User không tồn tại", 404);
      }

      // Sequelize sẽ tự động xóa các bản ghi liên quan (cascade)
      await user.destroy();

      return ApiResponse.success(res, "Xóa user thành công");
    } catch (error) {
      console.error("Delete user error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new AdminUserController();
