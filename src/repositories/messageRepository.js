const db = require("../models");

class messageRepository {
  async createMessage(messageData) {
    return await db.Message.create(messageData);
  }

  async getMessageById(messageId) {
    return await db.Message.findByPk(messageId, {
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "name", "email", "avatar_url"]
        }
      ]
    });
  }

  async getMessagesByRoom(roomId, limit = 20) {
    return await db.Message.findAll({
      where: { room_id: roomId },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "name", "email", "avatar_url"]
        }
      ],
      order: [["created_at", "DESC"]],
      limit
    });
  }

  async getRecentMessages(roomId, limit = 20) {
    const messages = await this.getMessagesByRoom(roomId, limit);
    return messages.reverse(); // Đảo ngược để tin nhắn cũ nhất ở đầu
  }

  async deleteMessage(messageId) {
    const message = await db.Message.findByPk(messageId);
    if (!message) return null;
    
    await message.destroy();
    return message;
  }
}

module.exports = new messageRepository();
