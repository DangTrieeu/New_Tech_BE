const { Room, User, Message, sequelize } = require("../models");
const ApiResponse = require("../utils/apiResponse");

class AdminRoomController {
  // FR-032: Get all rooms
  async getAllRooms(req, res) {
    try {
      const rooms = await sequelize.query(
        `SELECT 
          r.id, r.name, r.type, r.created_by, r.created_at,
          COUNT(DISTINCT ur.user_id) as memberCount,
          COUNT(DISTINCT m.id) as totalMessages,
          u.name as createdByName
        FROM rooms r
        LEFT JOIN user_rooms ur ON r.id = ur.room_id
        LEFT JOIN messages m ON r.id = m.room_id
        LEFT JOIN users u ON r.created_by = u.id
        GROUP BY r.id
        ORDER BY r.created_at DESC`,
        { type: sequelize.QueryTypes.SELECT }
      );

      return ApiResponse.success(res, "Lấy danh sách rooms thành công", {
        rooms,
        total: rooms.length,
      });
    } catch (error) {
      console.error("Get all rooms error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // FR-032: Get room by ID with members
  async getRoomById(req, res) {
    try {
      const { id } = req.params;

      const room = await sequelize.query(
        `SELECT 
          r.id, r.name, r.type, r.created_by, r.created_at,
          COUNT(DISTINCT ur.user_id) as memberCount,
          COUNT(DISTINCT m.id) as totalMessages,
          u.name as createdByName
        FROM rooms r
        LEFT JOIN user_rooms ur ON r.id = ur.room_id
        LEFT JOIN messages m ON r.id = m.room_id
        LEFT JOIN users u ON r.created_by = u.id
        WHERE r.id = ?
        GROUP BY r.id`,
        {
          replacements: [id],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!room || room.length === 0) {
        return ApiResponse.error(res, "Room không tồn tại", 404);
      }

      // Get members
      const members = await sequelize.query(
        `SELECT u.id, u.name, u.email, u.avatar_url, u.status, ur.create_at as joinedAt
        FROM users u
        INNER JOIN user_rooms ur ON u.id = ur.user_id
        WHERE ur.room_id = ?
        ORDER BY ur.create_at DESC`,
        {
          replacements: [id],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return ApiResponse.success(res, "Lấy thông tin room thành công", {
        room: room[0],
        members,
      });
    } catch (error) {
      console.error("Get room by ID error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // FR-032: Delete room
  async deleteRoom(req, res) {
    try {
      const { id } = req.params;

      const room = await Room.findByPk(id);
      if (!room) {
        return ApiResponse.error(res, "Room không tồn tại", 404);
      }

      // Delete room (cascade delete will handle user_room và messages)
      await room.destroy();

      return ApiResponse.success(res, "Xóa room thành công", {
        deletedId: id,
      });
    } catch (error) {
      console.error("Delete room error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new AdminRoomController();
