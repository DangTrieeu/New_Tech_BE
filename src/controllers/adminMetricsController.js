const { User, Room, Message, sequelize } = require("../models");
const ApiResponse = require("../utils/apiResponse");

class AdminMetricsController {
  // FR-033: Get dashboard overview metrics
  async getMetricsOverview(req, res) {
    try {
      const [metrics] = await sequelize.query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as totalUsers,
          (SELECT COUNT(*) FROM rooms) as totalRooms,
          (SELECT COUNT(*) FROM messages) as totalMessages,
          (SELECT COUNT(*) FROM messages WHERE type = 'AI') as totalAIMessages,
          (SELECT COUNT(*) FROM users WHERE status = 'ONLINE') as onlineUsers
      `);

      // Get most active user
      const [mostActiveUser] = await sequelize.query(`
        SELECT u.id, u.name, u.email, u.avatar_url, COUNT(m.id) as messageCount
        FROM users u
        INNER JOIN messages m ON u.id = m.user_id
        GROUP BY u.id
        ORDER BY messageCount DESC
        LIMIT 1
      `);

      return ApiResponse.success(res, "Lấy metrics overview thành công", {
        ...metrics[0],
        mostActiveUser: mostActiveUser[0] || null,
      });
    } catch (error) {
      console.error("Get metrics overview error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // FR-033: Get messages by date (last 7 days)
  async getMessagesByDate(req, res) {
    try {
      const { days = 7 } = req.query;

      const messagesByDate = await sequelize.query(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM messages
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC`,
        {
          replacements: [days],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return ApiResponse.success(
        res,
        "Lấy messages by date thành công",
        messagesByDate
      );
    } catch (error) {
      console.error("Get messages by date error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new AdminMetricsController();
