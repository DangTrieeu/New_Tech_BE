const db = require("../models");
const { Op } = require("sequelize");

class AdminRepository {
    async getAllUsersWithStats() {
        return await db.User.findAll({
            attributes: [
                'id', 'name', 'email', 'avatar_url', 'role', 'status', 'created_at',
                [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('joined_rooms.id'))), 'totalRoomsJoined'],
                [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('messages.id'))), 'totalMessagesSent']
            ],
            include: [
                {
                    model: db.Room,
                    as: 'joined_rooms',
                    through: { attributes: [] },
                    attributes: [],
                    required: false
                },
                {
                    model: db.Message,
                    as: 'messages',
                    attributes: [],
                    required: false
                }
            ],
            group: ['User.id'],
            order: [['created_at', 'DESC']],
            raw: true,
            subQuery: false
        });
    }

    async getUserByIdWithStats(userId) {
        return await db.User.findAll({
            where: { id: userId },
            attributes: [
                'id', 'name', 'email', 'avatar_url', 'role', 'status', 'created_at',
                [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('joined_rooms.id'))), 'totalRoomsJoined'],
                [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('messages.id'))), 'totalMessagesSent']
            ],
            include: [
                {
                    model: db.Room,
                    as: 'joined_rooms',
                    through: { attributes: [] },
                    attributes: [],
                    required: false
                },
                {
                    model: db.Message,
                    as: 'messages',
                    attributes: [],
                    required: false
                }
            ],
            group: ['User.id'],
            raw: true,
            subQuery: false
        });
    }

    async getRoomsByUserId(userId) {
        const user = await db.User.findByPk(userId, {
            include: [{
                model: db.Room,
                as: 'joined_rooms',
                through: { attributes: [] },
                attributes: ['id', 'name', 'type', 'created_at']
            }]
        });

        if (!user || !user.joined_rooms) return [];

        return user.joined_rooms
            .map(room => room.get({ plain: true }))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    async findUserById(userId) {
        return await db.User.findByPk(userId);
    }

    async updateUser(user, updateData) {
        return await user.update(updateData);
    }

    async deleteUser(user) {
        return await user.destroy();
    }

    async getAllRoomsWithStats() {
        return await db.Room.findAll({
            attributes: [
                'id', 'name', 'type', 'created_by', 'created_at',
                [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('participants.id'))), 'memberCount'],
                [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('messages.id'))), 'totalMessages'],
                [db.sequelize.col('creator.name'), 'createdByName']
            ],
            include: [
                {
                    model: db.User,
                    as: 'participants',
                    through: { attributes: [] },
                    attributes: [],
                    required: false
                },
                {
                    model: db.Message,
                    as: 'messages',
                    attributes: [],
                    required: false
                },
                {
                    model: db.User,
                    as: 'creator',
                    attributes: ['name'],
                    required: false
                }
            ],
            group: ['Room.id', 'creator.id'],
            order: [['created_at', 'DESC']],
            raw: true,
            subQuery: false
        });
    }

    async getRoomByIdWithStats(roomId) {
        return await db.Room.findAll({
            where: { id: roomId },
            attributes: [
                'id', 'name', 'type', 'created_by', 'created_at',
                [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('participants.id'))), 'memberCount'],
                [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('messages.id'))), 'totalMessages'],
                [db.sequelize.col('creator.name'), 'createdByName']
            ],
            include: [
                {
                    model: db.User,
                    as: 'participants',
                    through: { attributes: [] },
                    attributes: [],
                    required: false
                },
                {
                    model: db.Message,
                    as: 'messages',
                    attributes: [],
                    required: false
                },
                {
                    model: db.User,
                    as: 'creator',
                    attributes: ['name'],
                    required: false
                }
            ],
            group: ['Room.id', 'creator.id'],
            raw: true,
            subQuery: false
        });
    }

    async getRoomMembers(roomId) {
        const room = await db.Room.findByPk(roomId, {
            include: [{
                model: db.User,
                as: 'participants',
                attributes: ['id', 'name', 'email', 'avatar_url', 'status'],
                through: {
                    attributes: ['create_at']
                }
            }]
        });

        if (!room || !room.participants) return [];

        return room.participants
            .map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                avatar_url: user.avatar_url,
                status: user.status,
                joinedAt: user.UserRoom?.create_at || null
            }))
            .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
    }

    async findRoomById(roomId) {
        return await db.Room.findByPk(roomId);
    }

    async deleteRoom(room) {
        return await room.destroy();
    }

    async getMetricsOverview() {
        const totalUsers = await db.User.count();
        const totalRooms = await db.Room.count();
        const totalMessages = await db.Message.count();
        const totalAIMessages = await db.Message.count({ where: { type: 'AI' } });
        const onlineUsers = await db.User.count({ where: { status: 'ONLINE' } });

        return {
            totalUsers,
            totalRooms,
            totalMessages,
            totalAIMessages,
            onlineUsers
        };
    }

    async getMostActiveUser() {
        const result = await db.User.findOne({
            attributes: [
                'id', 'name', 'email', 'avatar_url',
                [db.sequelize.fn('COUNT', db.sequelize.col('messages.id')), 'messageCount']
            ],
            include: [{
                model: db.Message,
                as: 'messages',
                attributes: [],
                required: true
            }],
            group: ['User.id'],
            order: [[db.sequelize.literal('messageCount'), 'DESC']],
            raw: true,
            subQuery: false
        });

        return result || null;
    }

    async getMessagesByDate(days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await db.Message.findAll({
            attributes: [
                [db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'date'],
                [db.sequelize.fn('COUNT', '*'), 'count']
            ],
            where: {
                created_at: {
                    [Op.gte]: startDate
                }
            },
            group: [db.sequelize.fn('DATE', db.sequelize.col('created_at'))],
            order: [[db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'ASC']],
            raw: true
        });
    }

    async findAdminByEmail(email) {
        return await db.User.findOne({
            where: {
                email,
                role: "ADMIN"
            }
        });
    }

    async updateUserToken(user, token) {
        return await user.update({ token });
    }
}

module.exports = new AdminRepository();
