const { Message, User } = require("../models");
const messageRepository = require("../repositories/messageRepository");

const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const messages = await Message.findAndCountAll({
            where: { room_id: roomId },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name", "avatar_url"],
                    required: false, // Allow messages with null user_id (AI messages)
                },
                {
                    model: Message,
                    as: "replyToMessage",
                    attributes: ["id", "content", "type", "user_id", "created_at"],
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["id", "name", "avatar_url"],
                            required: false,
                        },
                    ],
                    required: false,
                },
            ],
            order: [["created_at", "DESC"]], // Get latest first
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

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

        return res.status(200).json({
            data: messagesWithAiInfo,
            total: messages.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(messages.count / limit),
        });
    } catch (error) {
        console.error("Get messages error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Multer-storage-cloudinary puts the url in req.file.path
        return res.status(200).json({
            url: req.file.path,
            filename: req.file.filename,
            mimetype: req.file.mimetype
        });
    } catch (error) {
        console.error("Upload file error:", error);
        return res.status(500).json({ message: "Upload failed" });
    }
};

const downloadFile = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findByPk(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (!message.file_url) {
            return res.status(400).json({ message: "No file attached to this message" });
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

        return res.redirect(downloadUrl);
    } catch (error) {
        console.error("Download file error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const recallMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id; // Lấy từ auth middleware

        const message = await messageRepository.recallMessage(messageId, userId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        return res.status(200).json({
            message: "Message recalled successfully",
            data: message
        });
    } catch (error) {
        console.error("Recall message error:", error);

        if (error.message === 'Unauthorized to recall this message') {
            return res.status(403).json({ message: error.message });
        }

        if (error.message === 'Message already recalled') {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getMessages,
    uploadFile,
    downloadFile,
    recallMessage,
};
