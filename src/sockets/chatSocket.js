const { Message, User, Room } = require("../models");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (io) => {
    // Middleware for authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.user.id}`);

        // Join room
        socket.on("join_room", (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.user.id} joined room ${roomId}`);
        });

        // Leave room
        socket.on("leave_room", (roomId) => {
            socket.leave(roomId);
            console.log(`User ${socket.user.id} left room ${roomId}`);
        });

        // Send message
        socket.on("send_message", async (data) => {
            // data: { room_id, content, type, file_url }
            try {
                const { room_id, content, type, file_url } = data;

                // Validate room existence and membership if needed

                const newMessage = await Message.create({
                    room_id,
                    user_id: socket.user.id,
                    content,
                    type: type || "TEXT",
                    file_url,
                });

                // Fetch user info to send back with message
                const messageWithUser = await Message.findOne({
                    where: { id: newMessage.id },
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["id", "name", "avatar_url"],
                        },
                    ],
                });

                io.to(room_id).emit("receive_message", messageWithUser);
            } catch (error) {
                console.error("Send message error:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // Delete message
        socket.on("delete_message", async (messageId) => {
            try {
                const message = await Message.findByPk(messageId);
                if (!message) {
                    return socket.emit("error", { message: "Message not found" });
                }

                // Check ownership
                if (message.user_id !== socket.user.id) {
                    return socket.emit("error", { message: "Unauthorized to delete this message" });
                }

                await message.destroy(); // Or soft delete if preferred

                io.to(message.room_id).emit("message_deleted", messageId);
            } catch (error) {
                console.error("Delete message error:", error);
                socket.emit("error", { message: "Failed to delete message" });
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
};
