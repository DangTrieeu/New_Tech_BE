const db = require("../models");

class userRepository {
  async findUserByEmail(email) {
    return await db.User.findOne({
      where: { email }
    });
  }

  async findUserById(userId) {
    return await db.User.findByPk(userId);
  }

  async createUser(userData) {
    return await db.User.create(userData);
  }

  async updateUser(userId, updateData) {
    const user = await db.User.findByPk(userId);
    if (!user) return null;
    
    await user.update(updateData);
    return user;
  }

  async deleteUser(userId) {
    const user = await db.User.findByPk(userId);
    if (!user) return null;
    
    await user.destroy();
    return user;
  }
}

module.exports = new userRepository();
