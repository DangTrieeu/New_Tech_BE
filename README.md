# Hướng dẫn kết nối MySQL cho Backend

Dự án này sử dụng **Sequelize** ORM để kết nối và làm việc với cơ sở dữ liệu **MySQL**.

## 1. Yêu cầu

Tạo `Schema` trong `MySQL` có tên trùng với `DB_NAME` trong file .env

## 2. Cài đặt dependencies

Chạy lệnh sau để cài đặt các thư viện cần thiết:

```bash
npm install
```

## 3. Cấu hình biến môi trường

Tạo một file `.env` tại thư mục gốc của dự án (`backend/`) và điền các thông tin kết nối database của bạn vào.

**Giải thích:**

- `DB_HOST`: Địa chỉ host của MySQL (thường là `localhost` nếu chạy trên máy cá nhân).
- `DB_USER`: Tên đăng nhập MySQL (mặc định thường là `root`).
- `DB_PASSWORD`: Mật khẩu của user MySQL.
- `DB_NAME`: Tên cơ sở dữ liệu bạn muốn kết nối (Hãy chắc chắn rằng bạn đã tạo database này trong MySQL Workbench hoặc CLI).
- `DB_PORT`: Cổng chạy MySQL (mặc định là `3306`).

## 4. Khởi tạo Database

Trước khi chạy ứng dụng, hãy đảm bảo bạn đã tạo database rỗng trong MySQL.
Ví dụ, nếu `DB_NAME=chat_app`, hãy chạy câu lệnh SQL sau trong MySQL Workbench hoặc terminal:

```sql
CREATE DATABASE chat_app;
```

Sequelize sẽ tự động đồng bộ (sync) và tạo các bảng dựa trên các Models đã định nghĩa khi ứng dụng khởi chạy.

## 5. Chạy dự án

Sau khi cấu hình xong, chạy lệnh sau để khởi động server:

```bash
npm start
```

Nếu kết nối thành công, bạn sẽ thấy thông báo trong terminal (tùy thuộc vào code trong `src/utils/connectDB.js`):

> Connection has been established successfully.

Nếu có lỗi, hãy kiểm tra lại thông tin trong file `.env` và đảm bảo MySQL Server đang chạy.
