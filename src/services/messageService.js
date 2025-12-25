const messageRepository = require("../repositories/messageRepository");

class MessageService {
    /**
     * Get messages with pagination
     * @param {number} roomId 
     * @param {number} page 
     * @param {number} limit 
     * @returns {Promise<Object>}
     */
    async getMessages(roomId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        const messages = await messageRepository.getMessagesWithPagination(roomId, limit, offset);

        // Add AI user info for messages with null user_id
        const messagesWithAiInfo = messages.rows.map(msg => {
            const msgData = msg.toJSON();
            if (msgData.user_id === null) {
                msgData.user = {
                    id: null,
                    name: 'AI Assistant',
                    avatar_url: null
                };
            }
            return msgData;
        });

        return {
            data: messagesWithAiInfo,
            total: messages.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(messages.count / limit),
        };
    }

    /**
     * Get message by ID for download
     * @param {number} messageId 
     * @returns {Promise<Object|null>}
     */
    async getMessageForDownload(messageId) {
        const message = await messageRepository.getMessageById(messageId);
        if (!message) {
            return null;
        }

        if (!message.file_url) {
            throw new Error("No file attached to this message");
        }

        let downloadUrl = message.file_url;

        // Handle Cloudinary URLs to force download
        if (downloadUrl.includes("cloudinary.com") && downloadUrl.includes("/upload/")) {
            // Check if fl_attachment is already present
            if (!downloadUrl.includes("fl_attachment")) {
                const uploadIndex = downloadUrl.indexOf("/upload/");
                downloadUrl = downloadUrl.slice(0, uploadIndex + 8) + "fl_attachment/" + downloadUrl.slice(uploadIndex + 8);
            }
        }

        return downloadUrl;
    }

    /**
     * Recall a message
     * @param {number} messageId 
     * @param {number} userId 
     * @returns {Promise<Object>}
     */
    async recallMessage(messageId, userId) {
        return await messageRepository.recallMessage(messageId, userId);
    }

    /**
     * Create a new message
     * @param {Object} messageData 
     * @returns {Promise<Object>}
     */
    async createMessage(messageData) {
        return await messageRepository.createMessage(messageData);
    }

    /**
     * Get message by ID
     * @param {number} messageId 
     * @returns {Promise<Object|null>}
     */
    async getMessageById(messageId) {
        return await messageRepository.getMessageById(messageId);
    }

    /**
     * Get recent messages
     * @param {number} roomId 
     * @param {number} limit 
     * @returns {Promise<Array>}
     */
    async getRecentMessages(roomId, limit = 20) {
        return await messageRepository.getRecentMessages(roomId, limit);
    }
}

module.exports = new MessageService();
