const { Room, User, Message, sequelize } = require("../models");
const ApiResponse = require("../utils/apiResponse");

class RoomController {
  // Get rooms for current user
  async getUserRooms(req, res) {
    try {
      const userId = req.user.id;

      const rooms = await sequelize.query(
        `
        SELECT 
          r.id,
          r.name,
          r.type,
          r.created_at as createdAt,
          COUNT(DISTINCT ur.user_id) as memberCount,
          COUNT(DISTINCT m.id) as messageCount,
          MAX(m.created_at) as lastMessageAt
        FROM rooms r
        INNER JOIN user_room ur ON r.id = ur.room_id
        LEFT JOIN messages m ON r.id = m.room_id
        WHERE ur.user_id = :userId AND ur.status = 'active'
        GROUP BY r.id, r.name, r.type, r.created_at
        ORDER BY lastMessageAt DESC
        `,
        {
          replacements: { userId },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return ApiResponse.success(res, "Lấy danh sách rooms thành công", {
        rooms,
        total: rooms.length,
      });
    } catch (error) {
      console.error("Get user rooms error:", error);
      return ApiResponse.error(res, "Lỗi khi lấy danh sách rooms", 500);
    }
  }

  // Get room detail
  async getRoomById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if user is member
      const isMember = await sequelize.query(
        `SELECT 1 FROM user_room WHERE room_id = :roomId AND user_id = :userId AND status = 'active'`,
        {
          replacements: { roomId: id, userId },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!isMember || isMember.length === 0) {
        return ApiResponse.error(res, "Bạn không có quyền truy cập room này", 403);
      }

      const room = await sequelize.query(
        `
        SELECT 
          r.*,
          COUNT(DISTINCT ur.user_id) as memberCount,
          COUNT(DISTINCT m.id) as messageCount
        FROM rooms r
        LEFT JOIN user_room ur ON r.id = ur.room_id
        LEFT JOIN messages m ON r.id = m.room_id
        WHERE r.id = :roomId
        GROUP BY r.id
        `,
        {
          replacements: { roomId: id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!room || room.length === 0) {
        return ApiResponse.error(res, "Room không tồn tại", 404);
      }

      // Get members
      const members = await sequelize.query(
        `
        SELECT 
          u.id,
          u.username,
          u.email,
          u.avatar,
          ur.status,
          ur.created_at as joinedAt
        FROM users u
        INNER JOIN user_room ur ON u.id = ur.user_id
        WHERE ur.room_id = :roomId
        ORDER BY ur.created_at DESC
        `,
        {
          replacements: { roomId: id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return ApiResponse.success(res, "Lấy thông tin room thành công", {
        room: { ...room[0], members },
      });
    } catch (error) {
      console.error("Get room detail error:", error);
      return ApiResponse.error(res, "Lỗi khi lấy thông tin room", 500);
    }
  }
}

module.exports = new RoomController();
