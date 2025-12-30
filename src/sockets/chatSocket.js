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
            // data: { room_id, content, type, file_url, reply_to_message_id }
            try {
                const { room_id, roomId, content, type, file_url, reply_to_message_id } = data;
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
                    reply_to_message_id: reply_to_message_id || null,
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
                        // Emit AI response với formatted metadata
                        const aiMessageWithMeta = {
                            ...aiResult.aiMessage,
                            formatted: true,
                            isMarkdown: true
                        };
                        io.to(String(finalRoomId)).emit("receive_message", aiMessageWithMeta);
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

                io.to(String(message.room_id)).emit("message_deleted", messageId);
            } catch (error) {
                console.error("Delete message error:", error);
                socket.emit("error", { message: "Failed to delete message" });
            }
        });

        // Recall message
        socket.on("recall_message", async (data) => {
            console.log("[RECALL] ========== START RECALL MESSAGE ==========");
            console.log("[RECALL] Received data:", data);
            console.log("[RECALL] User ID:", socket.user.id);

            try {
                const { messageId } = data;
                const userId = socket.user.id;

                console.log("[RECALL] Finding message with ID:", messageId);
                const message = await Message.findByPk(messageId);

                if (!message) {
                    console.log("[RECALL] ❌ Message not found");
                    return socket.emit("error", { message: "Message not found" });
                }

                console.log("[RECALL] Message found:", {
                    id: message.id,
                    room_id: message.room_id,
                    user_id: message.user_id,
                    is_recalled: message.is_recalled
                });

                // Check ownership
                if (message.user_id !== userId) {
                    console.log("[RECALL] ❌ Unauthorized:", { messageUserId: message.user_id, requestUserId: userId });
                    return socket.emit("error", { message: "Unauthorized to recall this message" });
                }

                // Check if already recalled
                if (message.is_recalled) {
                    console.log("[RECALL] ❌ Already recalled");
                    return socket.emit("error", { message: "Message already recalled" });
                }

                // Recall message
                message.is_recalled = true;
                message.recalled_at = new Date();
                await message.save();

                console.log("[RECALL] ✅ Message updated successfully");
                console.log("[RECALL] Broadcasting to room:", String(message.room_id));

                const payload = {
                    messageId: message.id,
                    room_id: message.room_id,
                    is_recalled: true,
                    recalled_at: message.recalled_at
                };

                console.log("[RECALL] Payload:", payload);

                // Emit to all users in the room
                io.to(String(message.room_id)).emit("message_recalled", payload);

                console.log("[RECALL] ✅ Event emitted successfully");
                console.log("[RECALL] ========== END RECALL MESSAGE ==========");
            } catch (error) {
                console.error("[RECALL] ❌ ERROR:", error);
                console.error("[RECALL] Error stack:", error.stack);
                socket.emit("error", { message: "Failed to recall message" });
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
};
