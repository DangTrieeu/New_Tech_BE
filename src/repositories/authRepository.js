const db = require("../models");

class authRepository {
  async findUserByEmail(email, provider = 'local') {
    return await db.User.findOne({
      where: { 
        email,
        provider
      }
    });
  }

  async findUserById(userId) {
    return await db.User.findByPk(userId);
  }

  async updateUserToken(userId, token, status = 'ONLINE') {
    const user = await db.User.findByPk(userId);
    if (!user) return null;
    
    await user.update({
      token,
      status
    });
    
    return user;
  }

  async clearUserToken(userId) {
    const user = await db.User.findByPk(userId);
    if (!user) return null;
    
    await user.update({
      token: null,
      status: 'OFFLINE'
    });
    
    return user;
  }
}

module.exports = new authRepository();