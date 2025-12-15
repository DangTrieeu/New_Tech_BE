'use strict';

const bcrypt = require('bcryptjs');

/**
 * Hàm tạo dữ liệu user mẫu.
 * @param {string} name - Tên người dùng
 * @param {string} defaultPassword - Mật khẩu mặc định
 * @returns {object} Bản ghi user
 */
function createUserData(name, defaultPassword) {
  // Băm mật khẩu (trong môi trường thực tế, luôn băm mật khẩu)
  const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

  return {
    name: name,
    email: `${name}@gmail.com`,
    password: hashedPassword,
    provider: 'local',
    role: 'USER',
    status: 'OFFLINE',
    created_at: new Date(),
    // Các trường khác có thể để mặc định hoặc là null
  };
}

module.exports = {
  /**
   * Phương thức được chạy khi migration được áp dụng
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  up: async (queryInterface, Sequelize) => {
    // 1. Định nghĩa 20 tên user
    const userNames = [
      'trieu',
      'trung',
      'huan',
      'an',
      'binh',
      'cuong',
      'dung',
      'hieu',
      'khoa',
      'lan',
      'mai',
      'nam',
      'oanh',
      'phong',
      'quang',
      'son',
      'thao',
      'tuan',
      'uyen',
      'viet'
    ];

    // 2. Mật khẩu mặc định
    const defaultPassword = '123123';

    // 3. Tạo mảng dữ liệu user
    const usersData = userNames.map(name => createUserData(name, defaultPassword));

    // 4. Thêm dữ liệu vào bảng 'users'
    await queryInterface.bulkInsert('users', usersData, {});

    console.log(`Đã thêm ${usersData.length} user mẫu vào cơ sở dữ liệu.`);
  },

  /**
   * Phương thức được chạy khi migration được hoàn tác (rollback)
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  down: async (queryInterface, Sequelize) => {
    // Xóa tất cả các user mà chúng ta đã thêm vào trong phương thức up.
    // Lưu ý: Nếu có các ràng buộc (foreign key) với các bảng khác,
    // việc xóa có thể thất bại trừ khi bạn cấu hình CASCADE hoặc xóa các bản ghi liên quan trước.
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: [
          'trieu@gmail.com',
          'trung@gmail.com',
          'huan@gmail.com',
          // Thêm các email khác nếu bạn muốn xóa chính xác các user này
        ]
      }
    }, {});

    // Cách đơn giản hơn (nếu bạn biết đây là tất cả dữ liệu):
    // await queryInterface.bulkDelete('users', null, {});
  }
};