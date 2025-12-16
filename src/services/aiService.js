const messageRepository = require("../repositories/messageRepository");
const groqService = require("./groqService");
const SecurityValidator = require("../utils/securityValidator");
const semanticCacheService = require("./semanticCacheService");

class aiService {
  async handleAiChat(roomId, userId, question, options = { createUserMessage: true }) {
    // 1. Kiểm tra cache trước
    const cachedResult = await semanticCacheService.findSimilarQuestion(question);

    if (cachedResult) {
      console.log("Cache HIT");
      // Lưu câu hỏi của user
      if (options.createUserMessage) {
        await messageRepository.createMessage({
          room_id: roomId,
          user_id: userId,
          type: 'TEXT',
          content: `@AI ${question}`
        });
      }

      // Lưu câu trả lời từ cache
      const aiMessage = await messageRepository.createMessage({
        room_id: roomId,
        user_id: null,
        type: 'AI',
        content: cachedResult.answer
      });

      return {
        question: options.createUserMessage ? `@AI ${question}` : question,
        answer: cachedResult.answer,
        aiMessage
      };
    }

    // 2. Cache MISS - Gọi AI API
    // LỚP BẢO VỆ 1: Kiểm tra câu hỏi nhạy cảm TRƯỚC KHI gọi AI
    if (SecurityValidator.isSensitiveQuery(question)) {
      console.log(`Blocked sensitive query: "${question.substring(0, 50)}..."`);

      const safetyResponse = SecurityValidator.getSafetyResponse();

      // Lưu câu hỏi của user
      if (options.createUserMessage) {
        await messageRepository.createMessage({
          room_id: roomId,
          user_id: userId,
          type: 'TEXT',
          content: `@AI ${question}`
        });
      }

      // Lưu câu trả lời từ security validator
      const aiMessage = await messageRepository.createMessage({
        room_id: roomId,
        user_id: null,
        type: 'AI',
        content: safetyResponse
      });

      return {
        question: options.createUserMessage ? `@AI ${question}` : question,
        answer: safetyResponse,
        aiMessage,
        blocked: true
      };
    }

    // LỚP BẢO VỆ 2: System prompt trong AI (backup layer)
    // Lấy lịch sử cuộc trò chuyện (10 tin nhắn gần nhất)
    const recentMessages = await messageRepository.getRecentMessages(roomId, 10);

    // Format conversation history cho Groq
    const conversationHistory = groqService.formatConversationHistory(recentMessages);

    // Gọi AI để trả lời
    const aiResponse = await groqService.chatAssistant(question, conversationHistory);
    //console.log("AI Response:", aiResponse);

    // 3. Lưu vào cache để lần sau dùng (Chạy background để không block response)
    semanticCacheService.saveToCache(question, aiResponse).catch(err =>
      console.error("Background cache save error:", err)
    );

    // Lưu câu hỏi của user vào database
    if (options.createUserMessage) {
      await messageRepository.createMessage({
        room_id: roomId,
        user_id: userId,
        type: 'TEXT',
        content: `@AI ${question}`
      });
    }

    // Lưu câu trả lời của AI vào database
    const aiMessage = await messageRepository.createMessage({
      room_id: roomId,
      user_id: null,
      type: 'AI',
      content: aiResponse
    });

    return {
      question: options.createUserMessage ? `@AI ${question}` : question,
      answer: aiResponse,
      aiMessage
    };
  }

  async getSmartReplySuggestions(messageId) {
    // Lấy tin nhắn gốc
    const message = await messageRepository.getMessageById(messageId);

    if (!message) {
      throw new Error('Tin nhắn không tồn tại');
    }

    // Lấy context (5 tin nhắn gần nhất)
    const recentMessages = await messageRepository.getRecentMessages(message.room_id, 5);
    const conversationContext = groqService.formatConversationHistory(recentMessages);

    // Gọi AI để tạo gợi ý
    const suggestions = await groqService.smartReplySuggestions(
      message.content,
      conversationContext
    );

    return {
      messageId: message.id,
      originalMessage: message.content,
      suggestions
    };
  }

  async summarizeConversation(roomId, messageLimit = 20) {
    // Lấy tin nhắn gần nhất
    const messages = await messageRepository.getRecentMessages(roomId, messageLimit);

    if (messages.length === 0) {
      throw new Error('Không có tin nhắn để tóm tắt');
    }

    // Format messages để AI tóm tắt
    const formattedMessages = messages.map(msg => ({
      userName: msg.user ? msg.user.name : 'AI',
      content: msg.content,
      type: msg.type
    }));

    // Gọi AI để tóm tắt
    const summary = await groqService.summarizeConversation(formattedMessages);

    // Lưu tóm tắt vào database như một AI message
    const summaryMessage = await messageRepository.createMessage({
      room_id: roomId,
      user_id: null,
      type: 'AI',
      content: `📝 **Tóm tắt cuộc trò chuyện:**\n\n${summary}`
    });

    return {
      summary,
      messageCount: messages.length,
      summaryMessage
    };
  }
}

module.exports = new aiService();
