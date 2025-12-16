const { Message, User } = require("../models");

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
                },
            ],
            order: [["created_at", "DESC"]], // Get latest first
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        // Reverse to show oldest to newest in chat UI if needed, 
        // but usually API returns latest first for pagination logic.
        // Client can reverse it.

        return res.status(200).json({
            data: messages.rows,
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

module.exports = {
    getMessages,
    uploadFile,
};
