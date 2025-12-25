const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const upload = require("../middlewares/uploadMiddleware");
const authMiddleware = require("../middlewares/authMiddleware"); // Assuming you have auth middleware

// Get messages history
router.get("/:roomId", authMiddleware.verifyToken, messageController.getMessages);

// Upload file
router.post("/upload", authMiddleware.verifyToken, upload.single("file"), messageController.uploadFile);

// Download file
router.get("/download/:messageId", authMiddleware.verifyToken, messageController.downloadFile);

// Recall message
router.put("/recall/:messageId", authMiddleware.verifyToken, messageController.recallMessage);

module.exports = router;
