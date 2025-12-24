const roomService = require("../services/roomService");
const ApiResponse = require("../utils/apiResponse");

class RoomController {
    // Lấy hoặc tạo phòng chat 1-1
    async getPrivateRoom(req, res) {
        try {
            const currentUserId = req.user.id;
            const { partnerId } = req.body;

            if (!partnerId) {
                return ApiResponse.error(res, "partnerId là bắt buộc", 400);
            }

            if (currentUserId == partnerId) {
                return ApiResponse.error(res, "Không thể chat với chính mình", 400);
            }

            const room = await roomService.getPrivateRoom(currentUserId, partnerId);
            return ApiResponse.success(res, "Lấy phòng chat thành công", room);
        } catch (error) {
            console.error(error);
            return ApiResponse.error(res, error.message, 500);
        }
    }

    // Tạo nhóm chat
    async createGroupRoom(req, res) {
        try {
            const currentUserId = req.user.id;
            const { name, participantIds } = req.body;

            if (!name || !participantIds || !Array.isArray(participantIds)) {
                return ApiResponse.error(res, "Tên nhóm và danh sách thành viên là bắt buộc", 400);
            }

            const room = await roomService.createGroupRoom(currentUserId, name, participantIds);
            return ApiResponse.success(res, "Tạo nhóm thành công", room);
        } catch (error) {
            console.error(error);
            return ApiResponse.error(res, error.message, 500);
        }
    }

    // Lấy danh sách phòng của user
    async getUserRooms(req, res) {
        try {
            const currentUserId = req.user.id;
            const rooms = await roomService.getUserRooms(currentUserId);
            return ApiResponse.success(res, "Lấy danh sách phòng thành công", rooms);
        } catch (error) {
            console.error(error);
            return ApiResponse.error(res, error.message, 500);
        }
    }

    // Lấy chi tiết phòng
    async getRoomDetail(req, res) {
        try {
            const { id } = req.params;
            const room = await roomService.getRoomDetail(id);
            if (!room) {
                return ApiResponse.error(res, "Phòng không tồn tại", 404);
            }
            return ApiResponse.success(res, "Lấy thông tin phòng thành công", room);
        } catch (error) {
            console.error(error);
            return ApiResponse.error(res, error.message, 500);
        }
    }

    // Cập nhật phòng
    async updateRoom(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            // Có thể thêm check quyền admin/creator ở đây

            const updatedRoom = await roomService.updateRoom(id, { name });
            return ApiResponse.success(res, "Cập nhật phòng thành công", updatedRoom);
        } catch (error) {
            console.error(error);
            return ApiResponse.error(res, error.message, 500);
        }
    }

    // Xóa phòng
    async deleteRoom(req, res) {
        try {
            const { id } = req.params;
            // Có thể thêm check quyền admin/creator ở đây

            await roomService.deleteRoom(id);
            return ApiResponse.success(res, "Xóa phòng thành công");
        } catch (error) {
            console.error(error);
            return ApiResponse.error(res, error.message, 500);
        }
    }

    // Thêm thành viên
    async addParticipants(req, res) {
        try {
            const { id } = req.params;
            const { userIds } = req.body; // Array of user IDs

            if (!userIds || !Array.isArray(userIds)) {
                return ApiResponse.error(res, "Danh sách userIds là bắt buộc", 400);
            }

            const result = await roomService.addParticipants(id, userIds);

            // Emit socket event to notify room members
            const io = req.app.get('io');
            if (io) {
                io.to(String(id)).emit("room_updated", {
                    roomId: id,
                    action: "members_added",
                    room: result
                });
            }

            return ApiResponse.success(res, "Thêm thành viên thành công", result);
        } catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }

    // Xóa thành viên
    async removeParticipant(req, res) {
        try {
            const { id } = req.params;
            const { userId } = req.body;

            if (!userId) {
                return ApiResponse.error(res, "userId là bắt buộc", 400);
            }

            const result = await roomService.removeParticipant(id, userId);
            return ApiResponse.success(res, "Xóa thành viên thành công", result);
        } catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
}

module.exports = new RoomController();
