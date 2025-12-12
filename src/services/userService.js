const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcryptjs");

class userService {
  async register(userData) {
    const { name, email, password } = userData;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new Error('Email đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = await userRepository.createUser({
      name,
      email,
      password: hashedPassword,
      provider: 'local',
      role: 'USER',
      status: 'OFFLINE'
    });

    // Trả về user an toàn (ẩn password)
    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar_url: newUser.avatar_url,
      role: newUser.role,
      status: newUser.status,
      created_at: newUser.created_at
    };

    return safeUser;
  }

  async getProfile(userId) {
    const user = await userRepository.findUserById(userId);
    
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    // Trả về user an toàn (ẩn password & token)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      role: user.role,
      status: user.status,
      created_at: user.created_at
    };

    return safeUser;
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.updateUser(userId, updateData);
    
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }
    // Trả về user an toàn
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      role: user.role,
      status: user.status
    };

    return safeUser;
  }
}

module.exports = new userService();
