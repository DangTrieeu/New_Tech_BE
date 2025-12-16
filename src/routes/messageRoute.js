const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const upload = require("../middlewares/uploadMiddleware");
const authMiddleware = require("../middlewares/authMiddleware"); // Assuming you have auth middleware

// Get messages history
router.get("/:roomId", authMiddleware.verifyToken, messageController.getMessages);

// Upload file
router.post("/upload", authMiddleware.verifyToken, upload.single("file"), messageController.uploadFile);

module.exports = router;
