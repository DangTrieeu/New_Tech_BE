const { Message, User, Room } = require("../models");
const jwt = require("jsonwebtoken");
const aiService = require("../services/aiService");
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

        socket.on("join_room", (data) => {
            // Xử lý cả trường hợp nhận object hoặc string/number
            const roomId = typeof data === 'object' ? data.roomId : data;
            socket.join(String(roomId));
            console.log(`User ${socket.user.id} joined room ${roomId}`);
        });

        // Leave room - SỬA LẠI
        socket.on("leave_room", (data) => {
            // Xử lý cả trường hợp nhận object hoặc string/number
            const roomId = typeof data === 'object' ? data.roomId : data;
            socket.leave(String(roomId));
            console.log(`User ${socket.user.id} left room ${roomId}`);
        });

        // Send message
        socket.on("send_message", async (data) => {
            console.log("Received send_message event:", data); // Log data nhận được
            // data: { room_id, content, type, file_url }
            try {
                const { room_id, roomId, content, type, file_url } = data;
                const finalRoomId = room_id || roomId;

                if (!finalRoomId) {
                    console.error("Missing room_id in send_message event");
                    return socket.emit("error", { message: "room_id is required" });
                }

                // Validate room existence and membership if needed

                const newMessage = await Message.create({
                    room_id: finalRoomId,
                    user_id: socket.user.id,
                    content,
                    type: type || "TEXT",
                    file_url,
                });

                console.log("Message created:", newMessage.id); // Log message id

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

                // Emit to room (convert to string just in case)
                io.to(String(finalRoomId)).emit("receive_message", messageWithUser);
                console.log(`Emitted receive_message to room ${finalRoomId}`);

                // Check for AI interaction
                const room = await Room.findByPk(finalRoomId);
                const isAiPrivate = room && room.type === 'AI_PRIVATE';
                const isAiMention = content && content.includes("@AI");

                if (isAiPrivate || isAiMention) {
                    console.log("Triggering AI response...");
                    // Call AI Service
                    // We pass createUserMessage: false because we already created it above.
                    const aiResult = await aiService.handleAiChat(finalRoomId, socket.user.id, content, { createUserMessage: false });

                    if (aiResult && aiResult.aiMessage) {
                        // Add AI user info manually for consistent frontend display
                        const aiMessageWithUser = {
                            ...aiResult.aiMessage.toJSON(),
                            user: {
                                id: null,
                                name: 'AI Assistant',
                                avatar_url: null
                            }
                        };
                        // Emit AI response
                        io.to(String(finalRoomId)).emit("receive_message", aiMessageWithUser);
                    }
                }

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
