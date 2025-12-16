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

    // 3. Tạo dữ liệu
    const usersData = userNames.map((name, index) => ({
      name: name,
      email: `${name}@gmail.com`,
      password: defaultPassword,
      provider: 'local',
      role: index < 3 ? 'ADMIN' : 'USER', // 3 người đầu là ADMIN
      status: 'OFFLINE',
      created_at: new Date()
    }));

    // 4. Insert vào DB
    await queryInterface.bulkInsert('users', usersData, {});
    console.log(`Seeded ${usersData.length} users (3 Admins).`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};