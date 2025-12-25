const messageService = require("../services/messageService");

const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const result = await messageService.getMessages(roomId, page, limit);

        return res.status(200).json(result);
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

        const downloadUrl = await messageService.getMessageForDownload(messageId);

        if (!downloadUrl) {
            return res.status(404).json({ message: "Message not found" });
        }

        return res.redirect(downloadUrl);
    } catch (error) {
        console.error("Download file error:", error);

        if (error.message === "No file attached to this message") {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const recallMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id; // Lấy từ auth middleware

        const message = await messageService.recallMessage(messageId, userId);

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
