const { User, Message, sequelize } = require("../models");
const { Room } = require("../models");
const ApiResponse = require("../utils/apiResponse");
const { Op } = require("sequelize");

class AdminMetricsController {
  // GET /admin/metrics/overview - Tổng quan dashboard
  async getMetricsOverview(req, res) {
    try {
      // Total users
      const totalUsers = await User.count();

      // Total rooms
      const totalRooms = await Room.count();

      // Total messages
      const totalMessages = await Message.count();

      // Total AI messages
      const totalAIMessages = await Message.count({
        where: { type: "AI" },
      });

      // Online users
      const onlineUsers = await User.count({
        where: { status: "ONLINE" },
      });

      // Most active user (user with most messages)
      const mostActiveUser = await User.findOne({
        attributes: [
          "id",
          "name",
          "email",
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM messages
              WHERE messages.user_id = User.id
            )`),
            "messageCount",
          ],
        ],
        order: [[sequelize.literal("messageCount"), "DESC"]],
      });

      return ApiResponse.success(res, "Lấy metrics thành công", {
        totalUsers,
        totalRooms,
        totalMessages,
        totalAIMessages,
        onlineUsers,
        mostActiveUser: mostActiveUser
          ? {
              id: mostActiveUser.id,
              name: mostActiveUser.name,
              email: mostActiveUser.email,
              messageCount: mostActiveUser.get("messageCount"),
            }
          : null,
      });
    } catch (error) {
      console.error("Get metrics overview error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // GET /admin/metrics/messages-by-date - Messages theo ngày
  async getMessagesByDate(req, res) {
    try {
      const { days = 7 } = req.query;

      const messageStats = await Message.findAll({
        attributes: [
          [sequelize.fn("DATE", sequelize.col("created_at")), "date"],
          [sequelize.fn("COUNT", sequelize.col("id")), "total"],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal('CASE WHEN type = "AI" THEN 1 ELSE 0 END')
            ),
            "aiMessages",
          ],
        ],
        where: {
          created_at: {
            [Op.gte]: sequelize.literal(`DATE_SUB(NOW(), INTERVAL ${parseInt(days)} DAY)`),
          },
        },
        group: [sequelize.fn("DATE", sequelize.col("created_at"))],
        order: [[sequelize.fn("DATE", sequelize.col("created_at")), "ASC"]],
        raw: true,
      });

      return ApiResponse.success(res, "Lấy thống kê messages thành công", {
        days: parseInt(days),
        data: messageStats,
      });
    } catch (error) {
      console.error("Get messages by date error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new AdminMetricsController();
