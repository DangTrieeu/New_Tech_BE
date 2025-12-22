const adminRepository = require("../repositories/adminRepository");
const bcrypt = require("bcryptjs");
const JwtUtils = require("../utils/jwt");

class AdminService {
  // ==================== AUTH SERVICES ====================

  /**
   * Admin login
   */
  async login(email, password) {
    // Validate input
    if (!email || !password) {
      throw new Error("Email và password là bắt buộc");
    }

    // Find admin user
    const user = await adminRepository.findAdminByEmail(email);
    if (!user) {
      throw new Error("Tài khoản admin không tồn tại");
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Mật khẩu không đúng");
    }

    // Generate tokens
    const accessToken = JwtUtils.signAccess({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = JwtUtils.signRefresh({ id: user.id });

    // Update refresh token in database
    await adminRepository.updateUserToken(user, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    };
  }

  // ==================== USER SERVICES ====================

  /**
   * Get all users with statistics
   */
  async getAllUsers() {
    const users = await adminRepository.getAllUsersWithStats();
    return {
      users,
      total: users.length,
    };
  }

  /**
   * Get user details by ID
   */
  async getUserById(userId) {
    const userResult = await adminRepository.getUserByIdWithStats(userId);

    if (!userResult || userResult.length === 0) {
      throw new Error("User không tồn tại");
    }

    const rooms = await adminRepository.getRoomsByUserId(userId);

    return {
      user: userResult[0],
      rooms,
    };
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId, status) {
    // Validate status
    if (!status || !["ONLINE", "OFFLINE"].includes(status)) {
      throw new Error("Status không hợp lệ");
    }

    const user = await adminRepository.findUserById(userId);
    if (!user) {
      throw new Error("User không tồn tại");
    }

    await adminRepository.updateUser(user, { status });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
    };
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    const user = await adminRepository.findUserById(userId);
    if (!user) {
      throw new Error("User không tồn tại");
    }

    // Prevent deleting admin accounts
    if (user.role === "ADMIN") {
      throw new Error("Không thể xóa tài khoản admin");
    }

    await adminRepository.deleteUser(user);

    return { deletedId: userId };
  }

  // ==================== ROOM SERVICES ====================

  /**
   * Get all rooms with statistics
   */
  async getAllRooms() {
    const rooms = await adminRepository.getAllRoomsWithStats();
    return {
      rooms,
      total: rooms.length,
    };
  }

  /**
   * Get room details by ID
   */
  async getRoomById(roomId) {
    const roomResult = await adminRepository.getRoomByIdWithStats(roomId);

    if (!roomResult || roomResult.length === 0) {
      throw new Error("Room không tồn tại");
    }

    const members = await adminRepository.getRoomMembers(roomId);

    return {
      room: roomResult[0],
      members,
    };
  }

  /**
   * Delete room
   */
  async deleteRoom(roomId) {
    const room = await adminRepository.findRoomById(roomId);
    if (!room) {
      throw new Error("Room không tồn tại");
    }

    await adminRepository.deleteRoom(room);

    return { deletedId: roomId };
  }

  // ==================== METRICS SERVICES ====================

  /**
   * Get dashboard metrics overview
   */
  async getMetricsOverview() {
    const metrics = await adminRepository.getMetricsOverview();
    const mostActiveUser = await adminRepository.getMostActiveUser();

    return {
      ...metrics,
      mostActiveUser,
    };
  }

  /**
   * Get messages statistics by date
   */
  async getMessagesByDate(days = 7) {
    return await adminRepository.getMessagesByDate(days);
  }
}

module.exports = new AdminService();
