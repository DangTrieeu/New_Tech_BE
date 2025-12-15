const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const authMiddleware = require("../middlewares/authMiddleware");

// Tất cả routes đều cần authentication
router.use(authMiddleware.verifyToken);

// FR-020: AI Chat Assistant - @AI <question>
router.post("/chat", aiController.chatWithAI);

// FR-021: Smart Reply Suggestions - Bấm vào tin nhắn để lấy gợi ý
router.post("/smart-reply", aiController.getSmartReply);

// FR-022: Conversation Summary - @AI summarize
router.post("/summarize", aiController.summarizeConversation);

// Cache management
router.get("/cache/stats", aiController.getCacheStats);
router.delete("/cache", aiController.clearCache); // TODO: Add admin middleware

module.exports = router;
