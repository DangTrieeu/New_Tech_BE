const authRepository = require("../repositories/authRepository");
const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcryptjs");
const JwtUtils = require("../utils/jwt");
const googleConfig = require("../configs/google");

class authService {
  async login(email, password) {
    // Tìm user theo email và provider LOCAL
    const user = await authRepository.findUserByEmail(email, 'local');

    if (!user) throw new Error('Email không tồn tại');
    if (!user.password) throw new Error('Tài khoản không có mật khẩu');

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Sai mật khẩu');

    // Tạo access token & refresh token
    const accessToken = JwtUtils.signAccess({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    const refreshToken = JwtUtils.signRefresh({ id: user.id });

    // Cập nhật token và status vào user
    await authRepository.updateUserToken(user.id, refreshToken, 'ONLINE');

    // Trả về user an toàn (ẩn password)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      role: user.role,
      status: 'ONLINE'
    };

    return { accessToken, refreshToken, user: safeUser };
  }

  async logout(userId) {
    // Xóa token và cập nhật status về OFFLINE
    const user = await authRepository.clearUserToken(userId);
    
    if (!user) throw new Error('Người dùng không tồn tại');

    return { message: 'Đăng xuất thành công' };
  }

  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = JwtUtils.verifyRefresh(refreshToken);
      
      // Tìm user và kiểm tra refresh token có khớp không
      const user = await authRepository.findUserById(decoded.id);
      
      if (!user) throw new Error('Người dùng không tồn tại');
      if (user.token !== refreshToken) throw new Error('Refresh token không hợp lệ');

      // Tạo access token mới
      const newAccessToken = JwtUtils.signAccess({ 
        id: user.id, 
        email: user.email, 
        role: user.role 
      });

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  async loginWithGoogle(googleUserData) {
    if (!googleUserData.emailVerified) {
      throw new Error('Email Google chưa được xác thực');
    }

    // Tìm user theo email và provider google
    let user = await authRepository.findUserByEmail(googleUserData.email, 'google');

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      user = await userRepository.createUser({
        email: googleUserData.email,
        name: googleUserData.name,
        avatar_url: googleUserData.avatar_url,
        provider: 'google',
        role: 'USER',
        status: 'ONLINE'
      });
    }

    // Tạo access token & refresh token
    const accessToken = JwtUtils.signAccess({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    const refreshToken = JwtUtils.signRefresh({ id: user.id });

    // Cập nhật token và status
    await authRepository.updateUserToken(user.id, refreshToken, 'ONLINE');

    // Trả về user an toàn
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      role: user.role,
      status: 'ONLINE',
      provider: 'google'
    };

    return { accessToken, refreshToken, user: safeUser };
  }

}
module.exports = new authService();