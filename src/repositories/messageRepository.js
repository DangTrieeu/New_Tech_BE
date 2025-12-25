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
        },
        {
          model: db.Message,
          as: "replyToMessage",
          attributes: ["id", "content", "type", "user_id", "created_at"],
          include: [
            {
              model: db.User,
              as: "user",
              attributes: ["id", "name", "email", "avatar_url"],
              required: false
            }
          ],
          required: false
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
        },
        {
          model: db.Message,
          as: "replyToMessage",
          attributes: ["id", "content", "type", "user_id", "created_at"],
          include: [
            {
              model: db.User,
              as: "user",
              attributes: ["id", "name", "email", "avatar_url"],
              required: false
            }
          ],
          required: false
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

  async getMessagesWithPagination(roomId, limit = 20, offset = 0) {
    return await db.Message.findAndCountAll({
      where: { room_id: roomId },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "name", "avatar_url"],
          required: false, // Allow messages with null user_id (AI messages)
        },
        {
          model: db.Message,
          as: "replyToMessage",
          attributes: ["id", "content", "type", "user_id", "created_at"],
          include: [
            {
              model: db.User,
              as: "user",
              attributes: ["id", "name", "avatar_url"],
              required: false,
            },
          ],
          required: false,
        },
      ],
      order: [["created_at", "ASC"]], // Get oldest first for correct display order
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  }

  async deleteMessage(messageId) {
    const message = await db.Message.findByPk(messageId);
    if (!message) return null;

    await message.destroy();
    return message;
  }

  async recallMessage(messageId, userId) {
    const message = await db.Message.findByPk(messageId);
    if (!message) return null;

    // Kiểm tra xem tin nhắn có thuộc về user này không
    if (message.user_id !== userId) {
      throw new Error('Unauthorized to recall this message');
    }

    // Kiểm tra xem tin nhắn đã bị thu hồi chưa
    if (message.is_recalled) {
      throw new Error('Message already recalled');
    }

    // Thu hồi tin nhắn
    message.is_recalled = true;
    message.recalled_at = new Date();
    await message.save();

    return message;
  }
}

module.exports = new messageRepository();
