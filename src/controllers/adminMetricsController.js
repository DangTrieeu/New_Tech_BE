const adminService = require("../services/adminService");
const ApiResponse = require("../utils/apiResponse");

class AdminMetricsController {
  // FR-033: Get dashboard overview metrics
  async getMetricsOverview(req, res) {
    try {
      const result = await adminService.getMetricsOverview();
      return ApiResponse.success(res, "Lấy metrics overview thành công", result);
    } catch (error) {
      console.error("Get metrics overview error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // FR-033: Get messages by date (last 7 days)
  async getMessagesByDate(req, res) {
    try {
      const { days = 7 } = req.query;
      const result = await adminService.getMessagesByDate(days);
      return ApiResponse.success(res, "Lấy messages by date thành công", result);
    } catch (error) {
      console.error("Get messages by date error:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new AdminMetricsController();
