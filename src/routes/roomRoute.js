const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const authMiddleware = require("../middlewares/authMiddleware");

// Protected routes
router.use(authMiddleware.verifyToken);

router.get("/", roomController.getUserRooms);
router.get("/:id", roomController.getRoomById);

module.exports = router;
