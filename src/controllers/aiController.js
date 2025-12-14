const aiService = require("../services/aiService");
const semanticCacheService = require("../services/semanticCacheService");
const ApiResponse = require("../utils/apiResponse");

class aiController {
  async chatWithAI(req, res) {
    try {
      const { roomId, question } = req.body;
      const userId = req.user.id;

      if (!roomId || !question) {
        return ApiResponse.error(res, 'roomId và question là bắt buộc', 400);
      }

      const result = await aiService.handleAiChat(roomId, userId, question);
      return ApiResponse.success(res, 'AI đã trả lời', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  async getSmartReply(req, res) {
    try {
      const { messageId } = req.body;

      if (!messageId) {
        return ApiResponse.error(res, 'messageId là bắt buộc', 400);
      }

      const result = await aiService.getSmartReplySuggestions(messageId);
      return ApiResponse.success(res, 'Đã tạo gợi ý phản hồi', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  async summarizeConversation(req, res) {
    try {
      const { roomId, messageLimit } = req.body;

      if (!roomId) {
        return ApiResponse.error(res, 'roomId là bắt buộc', 400);
      }

      const result = await aiService.summarizeConversation(
        roomId,
        messageLimit || 20
      );
      return ApiResponse.success(res, 'Đã tóm tắt cuộc trò chuyện', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  async getCacheStats(req, res) {
    try {
      const stats = await semanticCacheService.getCacheStats();
      return ApiResponse.success(res, 'Thống kê cache', stats);
    } catch (error) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  async clearCache(req, res) {
    try {
      await semanticCacheService.clearCache();
      return ApiResponse.success(res, 'Đã xóa toàn bộ cache');
    } catch (error) {
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new aiController();
