const { User, Room, sequelize } = require("../models");
const ApiResponse = require("../utils/apiResponse");

class AdminRoomController {
  // GET /admin/rooms - Lấy tất cả rooms với stats
  async getAllRooms(req, res) {
    try {
      const rooms = await Room.findAll({
        attributes: {
          include: [
            // Count members
            [
              sequelize.literal(`(
                SELECT COUNT(DISTINCT user_id)
                FROM userroom
                WHERE userroom.room_id = Room.id
              )`),
              "memberCount",
            ],
            // Count messages
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM messages
                WHERE messages.room_id = Room.id
              )`),
              "totalMessages",
            ],
          ],
        },
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      return ApiResponse.success(res, "Lấy danh sách rooms thành công", {
        count: rooms.length,
        rooms,
      });
    } catch (error) {
      console.error("Get all rooms error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // GET /admin/rooms/:id - Lấy chi tiết room
  async getRoomById(req, res) {
    try {
      const { id } = req.params;

      const room = await Room.findByPk(id, {
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM messages
                WHERE messages.room_id = Room.id
              )`),
              "totalMessages",
            ],
          ],
        },
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "email"],
          },
          {
            model: User,
            as: "participants",
            attributes: ["id", "name", "email", "avatar_url", "status"],
            through: { attributes: ["createdAt"] },
          },
        ],
      });

      if (!room) {
        return ApiResponse.error(res, "Room không tồn tại", 404);
      }

      return ApiResponse.success(res, "Lấy thông tin room thành công", room);
    } catch (error) {
      console.error("Get room by ID error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // DELETE /admin/rooms/:id - Xóa room
  async deleteRoom(req, res) {
    try {
      const { id } = req.params;

      const room = await Room.findByPk(id);
      if (!room) {
        return ApiResponse.error(res, "Room không tồn tại", 404);
      }

      await room.destroy();

      return ApiResponse.success(res, "Xóa room thành công");
    } catch (error) {
      console.error("Delete room error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new AdminRoomController();
