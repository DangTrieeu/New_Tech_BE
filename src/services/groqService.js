const groqConfig = require("../configs/groq");
const PromptConfig = require("../configs/prompts");

class GroqService {
  constructor() {
    this.groq = groqConfig.getClient();
    this.defaultModel = groqConfig.getModel("default");
    this.fastModel = groqConfig.getModel("fast");
  }

  async callGroq(messages, options = {}) {
    try {
      const defaultParams = groqConfig.getDefaultParams();

      const completion = await this.groq.chat.completions.create({
        messages,
        model: options.model || this.defaultModel,
        temperature: options.temperature ?? defaultParams.temperature,
        max_tokens: options.max_tokens || defaultParams.max_tokens,
        top_p: options.top_p ?? defaultParams.top_p,
      });

      return completion.choices[0]?.message?.content || null;
    } catch (error) {
      console.error("Groq API Error:", error);
      throw new Error("Lỗi khi gọi Groq API: " + error.message);
    }
  }

  async chatAssistant(question, conversationHistory = []) {
    const messages = [
      {
        role: "system",
        content: PromptConfig.CHAT_ASSISTANT.system
      },
      ...conversationHistory,
      {
        role: "user",
        content: PromptConfig.CHAT_ASSISTANT.user(question)
      }
    ];

    const response = await this.callGroq(messages, { temperature: 0.7 });
    return response;
  }

  async smartReplySuggestions(messageContent, conversationContext = []) {
    const contextStr = conversationContext.length > 0
      ? conversationContext.map(msg => `${msg.role}: ${msg.content}`).join('\n')
      : "";

    const messages = [
      {
        role: "system",
        content: PromptConfig.SMART_REPLY.system
      },
      {
        role: "user",
        content: PromptConfig.SMART_REPLY.user(messageContent, contextStr)
      }
    ];

    const response = await this.callGroq(messages, {
      temperature: 0.8,
      max_tokens: 256,
      model: this.fastModel
    });

    try {
      const suggestions = JSON.parse(response);
      return Array.isArray(suggestions) ? suggestions.slice(0, 3) : [
        "Cảm ơn bạn!",
        "Mình hiểu rồi.",
        "Được đó!"
      ];
    } catch {
      // Fallback nếu không parse được JSON
      return [
        "Cảm ơn bạn đã chia sẻ!",
        "Thật thú vị!",
        "Mình đồng ý với bạn."
      ];
    }
  }

  async summarizeConversation(messages) {
    const conversationText = messages
      .map(msg => `${msg.userName || 'User'}: ${msg.content}`)
      .join('\n');

    const promptMessages = [
      {
        role: "system",
        content: PromptConfig.SUMMARY.system
      },
      {
        role: "user",
        content: PromptConfig.SUMMARY.user(conversationText)
      }
    ];

    return await this.callGroq(promptMessages, {
      temperature: 0.5,
      max_tokens: 1024
    });
  }

  formatConversationHistory(messages, limit = 10) {
    return messages
      .slice(-limit)
      .map(msg => ({
        role: msg.type === 'AI' ? 'assistant' : 'user',
        content: msg.content
      }));
  }
}

module.exports = new GroqService();
