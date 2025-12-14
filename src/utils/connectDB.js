// utils/connectDB.js
const db = require("../models");

const connectDB = async () => {
  try {
    await db.sequelize.authenticate();
    // alter: true - Tự động thêm/sửa cột (GIỮ DATA, nhưng có thể lỗi với một số thay đổi phức tạp)
    // force: true - Xóa và tạo lại bảng (MẤT HẾT DATA)
    await db.sequelize.sync({ alter: true }); 
  } catch (err) {
    console.error(" Lỗi kết nối database:", err);
    process.exit(1); // Dừng chương trình nếu lỗi
  }
};

module.exports = connectDB;