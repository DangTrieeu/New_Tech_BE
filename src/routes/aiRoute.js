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

// Format markdown (optional - for testing)
router.post("/format-markdown", aiController.formatMarkdown);

module.exports = router;
