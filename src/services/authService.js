const authRepository = require("../repositories/authRepository");
const bcrypt = require("bcryptjs");
const JwtUtils = require("../utils/jwt");

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

}
module.exports = new authService();