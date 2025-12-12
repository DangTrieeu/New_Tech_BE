const { Room, User, Message, sequelize } = require("../models");
const { Op } = require("sequelize");

class RoomService {
    // Lấy hoặc tạo phòng chat 1-1
    async getPrivateRoom(userId1, userId2) {
        // Tìm phòng PRIVATE mà cả 2 user đều tham gia
        // Cách đơn giản: Lấy tất cả phòng PRIVATE của user1, lọc xem phòng nào có user2

        // 1. Lấy danh sách phòng PRIVATE của user1
        const user1 = await User.findByPk(userId1, {
            include: [{
                model: Room,
                as: "joined_rooms",
                where: { type: "PRIVATE" },
                include: [{
                    model: User,
                    as: "participants",
                    attributes: ["id", "name", "avatar_url", "email"]
                }]
            }]
        });

        let room = null;
        if (user1 && user1.joined_rooms) {
            room = user1.joined_rooms.find(r =>
                r.participants.some(p => p.id == userId2)
            );
        }

        // 2. Nếu tìm thấy thì trả về
        if (room) {
            return room;
        }

        // 3. Nếu chưa có, tạo mới
        const transaction = await sequelize.transaction();
        try {
            const newRoom = await Room.create({
                type: "PRIVATE",
                created_by: userId1,
                name: null // Private room thường không cần tên, hiển thị tên đối phương
            }, { transaction });

            // Thêm 2 user vào phòng
            await newRoom.addParticipants([userId1, userId2], { transaction });

            await transaction.commit();

            // Fetch lại room để có đủ thông tin participants
            return await Room.findByPk(newRoom.id, {
                include: [{
                    model: User,
                    as: "participants",
                    attributes: ["id", "name", "avatar_url", "email"]
                }]
            });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Tạo phòng chat nhóm
    async createGroupRoom(creatorId, name, participantIds) {
        const transaction = await sequelize.transaction();
        try {
            const newRoom = await Room.create({
                name: name,
                type: "GROUP",
                created_by: creatorId
            }, { transaction });

            // Thêm creator và các thành viên khác
            const allMembers = [creatorId, ...participantIds];
            // Loại bỏ trùng lặp nếu có
            const uniqueMembers = [...new Set(allMembers)];

            await newRoom.addParticipants(uniqueMembers, { transaction });

            await transaction.commit();

            return await Room.findByPk(newRoom.id, {
                include: [{
                    model: User,
                    as: "participants",
                    attributes: ["id", "name", "avatar_url"]
                }]
            });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Lấy danh sách phòng của user
    async getUserRooms(userId) {
        return await Room.findAll({
            include: [
                {
                    model: User,
                    as: "participants",
                    where: { id: userId },
                    attributes: [] // Chỉ dùng để filter, không cần select user info ở đây nếu không cần thiết
                },
                {
                    model: User,
                    as: "participants", // Include lại để lấy thông tin các thành viên khác trong phòng
                    attributes: ["id", "name", "avatar_url", "status"]
                },
                {
                    model: Message,
                    as: "messages",
                    limit: 1,
                    order: [["created_at", "DESC"]]
                }
            ],
            order: [["created_at", "DESC"]] // Hoặc order theo message mới nhất nếu phức tạp hơn
        });
    }

    // Lấy chi tiết phòng
    async getRoomDetail(roomId) {
        return await Room.findByPk(roomId, {
            include: [
                {
                    model: User,
                    as: "participants",
                    attributes: ["id", "name", "avatar_url", "email", "status"]
                }
            ]
        });
    }

    // Cập nhật thông tin phòng (Tên, Avatar - nếu có)
    async updateRoom(roomId, updateData) {
        const room = await Room.findByPk(roomId);
        if (!room) throw new Error("Phòng không tồn tại");

        return await room.update(updateData);
    }

    // Xóa phòng
    async deleteRoom(roomId) {
        const room = await Room.findByPk(roomId);
        if (!room) throw new Error("Phòng không tồn tại");

        return await room.destroy();
    }

    // Thêm thành viên vào nhóm
    async addParticipants(roomId, userIds) {
        const room = await Room.findByPk(roomId);
        if (!room) throw new Error("Phòng không tồn tại");
        if (room.type === 'PRIVATE') throw new Error("Không thể thêm thành viên vào chat 1-1");

        await room.addParticipants(userIds);
        return this.getRoomDetail(roomId);
    }

    // Xóa thành viên khỏi nhóm
    async removeParticipant(roomId, userId) {
        const room = await Room.findByPk(roomId);
        if (!room) throw new Error("Phòng không tồn tại");

        await room.removeParticipant(userId);
        return { message: "Đã xóa thành viên" };
    }
}

module.exports = new RoomService();
