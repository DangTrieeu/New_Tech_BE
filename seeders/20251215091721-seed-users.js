'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Danh sách user
    const userNames = [
      'trieu', 'trung', 'huan', // 3 Admin đầu tiên
      'an', 'binh', 'cuong', 'dung', 'hieu', 'khoa', 'lan',
      'mai', 'nam', 'oanh', 'phong', 'quang', 'son', 'thao', 'tuan', 'uyen', 'viet'
    ];

    // 2. Mật khẩu mặc định (đã hash)
    const defaultPassword = bcrypt.hashSync('123123', 10);

    // 3. Kiểm tra user đã tồn tại
    const existingUsers = await queryInterface.sequelize.query(
      `SELECT email FROM users WHERE email IN (${userNames.map(name => `'${name}@gmail.com'`).join(',')})`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const existingEmails = new Set(existingUsers.map(u => u.email));

    // 4. Lọc ra những user chưa tồn tại
    const usersData = userNames
      .filter((name, index) => !existingEmails.has(`${name}@gmail.com`))
      .map((name, index) => {
        const originalIndex = userNames.indexOf(name);
        return {
          name: name,
          email: `${name}@gmail.com`,
          password: defaultPassword,
          provider: 'local',
          role: originalIndex < 3 ? 'ADMIN' : 'USER', // 3 người đầu là ADMIN
          status: 'OFFLINE',
          created_at: new Date()
        };
      });

    // 5. Insert vào DB nếu có user mới
    if (usersData.length > 0) {
      await queryInterface.bulkInsert('users', usersData, {});
      console.log(`Seeded ${usersData.length} new users.`);
    } else {
      console.log('All users already exist. Skipping seeding.');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};