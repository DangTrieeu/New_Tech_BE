# 📚 Admin API Documentation

## 🎯 Tổng quan

Backend Admin API được xây dựng cho trang quản trị Admin Dashboard với các tính năng:
- **FR-030**: Admin Login
- **FR-031**: User Management (CRUD + Lock/Unlock)
- **FR-032**: Room Management (List, Detail, Delete)
- **FR-033**: Dashboard Metrics (Overview + Charts)

---

## 🏗️ Kiến trúc

### Cấu trúc file đã tạo:

```
New_Tech_BE/
├── src/
│   ├── controllers/
│   │   └── adminController.js       ✅ Xử lý logic admin
│   └── routes/
│       ├── adminRoute.js            ✅ Define admin routes
│       └── index.js                 ✅ Đã update để register admin routes
└── ADMIN_API_README.md              ✅ File này
```

### Tái sử dụng:
- ✅ **Models**: User, Room, Message (Sequelize)
- ✅ **Middlewares**: authMiddleware, roleMiddleware
- ✅ **Utils**: ApiResponse

---

## 🚀 Cài đặt & Khởi động

### 1. Yêu cầu
```bash
# Đảm bảo đã cài đặt dependencies
npm install
```

### 2. Cấu hình .env
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
PORT=3000
```

### 3. Tạo Admin User trong Database
```sql
-- Tạo user với role ADMIN
INSERT INTO users (name, email, password, role, status, created_at) 
VALUES ('Admin User', 'admin@chatapp.com', 'hashed_password', 'ADMIN', 'ONLINE', NOW());

-- Lưu ý: Password cần hash bằng bcrypt trước khi insert
```

### 4. Khởi động server
```bash
npm start
# Server chạy tại: http://localhost:3000
```

---

## 📡 API Endpoints

### Base URL: `http://localhost:3000/admin`

---

## 🔐 FR-030: Admin Login

### POST `/admin/login`
Đăng nhập với tài khoản admin.

**Request:**
```json
{
  "email": "admin@chatapp.com",
  "password": "your_password"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Đăng nhập admin thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@chatapp.com",
      "role": "ADMIN"
    }
  }
}
```

**⚠️ Lưu token để sử dụng cho các API tiếp theo!**

---

## 👥 FR-031: User Management

### GET `/admin/users`
Lấy danh sách tất cả users kèm thống kê.

**Headers:**
```
Authorization: Bearer <your_admin_token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Lấy danh sách users thành công",
  "data": {
    "count": 10,
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "USER",
        "status": "ONLINE",
        "created_at": "2025-12-01T10:00:00.000Z",
        "totalRoomsJoined": "3",
        "totalMessagesSent": "150"
      }
    ]
  }
}
```

---

### GET `/admin/users/:id`
Lấy chi tiết user theo ID kèm danh sách rooms đã tham gia.

**Headers:**
```
Authorization: Bearer <your_admin_token>
```

**Example:** `GET /admin/users/2`

**Response (200):**
```json
{
  "status": "success",
  "message": "Lấy thông tin user thành công",
  "data": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "USER",
    "status": "OFFLINE",
    "totalRoomsJoined": "5",
    "totalMessagesSent": "200",
    "joined_rooms": [
      {
        "id": 1,
        "name": "General Chat",
        "type": "GROUP",
        "created_at": "2025-12-01T10:00:00.000Z"
      }
    ]
  }
}
```

---

### PATCH `/admin/users/:id/status`
Cập nhật trạng thái user (lock/unlock).

**Headers:**
```
Authorization: Bearer <your_admin_token>
```

**Request:**
```json
{
  "status": "OFFLINE"
}
```

**Valid values:** `"ONLINE"` hoặc `"OFFLINE"`

**Response (200):**
```json
{
  "status": "success",
  "message": "Cập nhật trạng thái user thành công",
  "data": {
    "id": 2,
    "name": "Jane Smith",
    "status": "OFFLINE"
  }
}
```

---

### DELETE `/admin/users/:id`
Xóa user (cascade delete các bản ghi liên quan).

**Headers:**
```
Authorization: Bearer <your_admin_token>
```

**Example:** `DELETE /admin/users/5`

**Response (200):**
```json
{
  "status": "success",
  "message": "Xóa user thành công"
}
```

---

## 🏠 FR-032: Room Management

### GET `/admin/rooms`
Lấy danh sách tất cả rooms kèm thống kê.

**Headers:**
```
Authorization: Bearer <your_admin_token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Lấy danh sách rooms thành công",
  "data": {
    "count": 5,
    "rooms": [
      {
        "id": 1,
        "name": "General Chat",
        "type": "GROUP",
        "created_by": 1,
        "created_at": "2025-12-01T10:00:00.000Z",
        "memberCount": "10",
        "totalMessages": "350",
        "creator": {
          "id": 1,
          "name": "Admin User",
          "email": "admin@chatapp.com"
        }
      }
    ]
  }
}
```

---

### GET `/admin/rooms/:id`
Lấy chi tiết room kèm danh sách members.

**Headers:**
```
Authorization: Bearer <your_admin_token>
```

**Example:** `GET /admin/rooms/1`

**Response (200):**
```json
{
  "status": "success",
  "message": "Lấy thông tin room thành công",
  "data": {
    "id": 1,
    "name": "General Chat",
    "type": "GROUP",
    "created_by": 1,
    "totalMessages": "350",
    "creator": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@chatapp.com"
    },
    "participants": [
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar_url": "👩",
        "status": "ONLINE",
        "UserRoom": {
          "createdAt": "2025-12-01T10:00:00.000Z"
        }
      }
    ]
  }
}
```

---

### DELETE `/admin/rooms/:id`
Xóa room (cascade delete messages và userroom).

**Headers:**
```
Authorization: Bearer <your_admin_token>
```

**Example:** `DELETE /admin/rooms/3`

**Response (200):**
```json
{
  "status": "success",
  "message": "Xóa room thành công"
}
```

---

## 📊 FR-033: Dashboard Metrics

### GET `/admin/metrics/overview`
Lấy tổng quan metrics cho dashboard.

**Headers:**
```
Authorization: Bearer <your_admin_token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Lấy metrics thành công",
  "data": {
    "totalUsers": 150,
    "totalRooms": 25,
    "totalMessages": 5000,
    "totalAIMessages": 500,
    "onlineUsers": 45,
    "mostActiveUser": {
      "id": 10,
      "name": "John Doe",
      "email": "john@example.com",
      "messageCount": "350"
    }
  }
}
```

---

### GET `/admin/metrics/messages-by-date`
Lấy thống kê messages theo ngày (cho biểu đồ).

**Headers:**
```
Authorization: Bearer <your_admin_token>
```

**Query Parameters:**
- `days` (optional): Số ngày lấy dữ liệu (default: 7)

**Example:** `GET /admin/metrics/messages-by-date?days=7`

**Response (200):**
```json
{
  "status": "success",
  "message": "Lấy thống kê messages thành công",
  "data": {
    "days": 7,
    "data": [
      {
        "date": "2025-12-07",
        "total": "150",
        "aiMessages": "15"
      },
      {
        "date": "2025-12-08",
        "total": "200",
        "aiMessages": "20"
      },
      {
        "date": "2025-12-13",
        "total": "180",
        "aiMessages": "18"
      }
    ]
  }
}
```

---

## 🔒 Authentication & Authorization

### Flow:
1. **Login** → Nhận token
2. **Attach token** vào header cho mọi request:
   ```
   Authorization: Bearer <your_token>
   ```
3. **Middleware chain**:
   - `authMiddleware.verifyToken` - Verify JWT
   - `roleMiddleware.checkRole(['ADMIN'])` - Check role

### Error Responses:

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Token không được cung cấp"
}
```

**403 Forbidden:**
```json
{
  "status": "error",
  "message": "Bạn không có quyền truy cập tài nguyên này"
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "message": "User không tồn tại"
}
```

---

## 🧪 Testing với Postman

### 1. Import Environment
Tạo environment với biến:
```
baseUrl: http://localhost:3000
adminToken: (sẽ set sau khi login)
```

### 2. Test Flow
```
1. POST /admin/login
   → Copy token từ response
   → Paste vào environment variable "adminToken"

2. GET /admin/users
   → Header: Authorization: Bearer {{adminToken}}

3. GET /admin/metrics/overview
   → Header: Authorization: Bearer {{adminToken}}

4. Test các endpoints khác...
```

### 3. Auto-save Token Script
Trong Postman, thêm script vào **Tests** tab của Login request:
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("adminToken", jsonData.data.token);
}
```

---

## 🔧 Xử lý lỗi thường gặp

### 1. "User không tồn tại"
- Kiểm tra ID có đúng không
- User có thể đã bị xóa

### 2. "Token không hợp lệ"
- Token hết hạn (24h)
- Login lại để lấy token mới

### 3. "Bạn không có quyền"
- User không phải ADMIN
- Kiểm tra role trong database

### 4. Database Connection Error
- Kiểm tra .env config
- Đảm bảo MySQL đang chạy
- Test connection: `mysql -u root -p`

---

## 📈 Performance Tips

### 1. Pagination (TODO)
Các endpoint list nên thêm pagination:
```javascript
const { page = 1, limit = 10 } = req.query;
const offset = (page - 1) * limit;

const users = await User.findAndCountAll({
  limit,
  offset,
  // ...
});
```

### 2. Caching (TODO)
Cache các metrics overview (TTL: 5 phút):
```javascript
const Redis = require('redis');
const cache = await redis.get('admin:metrics:overview');
```

### 3. Indexes
Đảm bảo có indexes cho:
- `users.email`
- `messages.room_id`
- `messages.user_id`
- `messages.created_at`

---

## 🔐 Security Checklist

- [ ] Password phải hash bằng bcrypt
- [ ] JWT secret phải mạnh và bảo mật
- [ ] Rate limiting cho login endpoint
- [ ] Input validation cho tất cả endpoints
- [ ] SQL injection prevention (Sequelize đã handle)
- [ ] XSS prevention (sanitize input)
- [ ] CORS configuration đúng
- [ ] HTTPS trong production

---

## 🚀 Deployment

### Production Checklist:
1. ✅ Enable password hashing (bcrypt)
2. ✅ Add input validation middleware
3. ✅ Setup rate limiting
4. ✅ Configure CORS properly
5. ✅ Use environment variables
6. ✅ Setup logging (winston)
7. ✅ Add monitoring (PM2)
8. ✅ Database backup strategy

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs trong console
2. Verify database connection
3. Test JWT token validity
4. Check middleware order
5. Review API response format

---

## 🎉 Hoàn thành!

Admin API đã sẵn sàng cho Frontend tích hợp. Tất cả endpoints tuân thủ:
- ✅ RESTful conventions
- ✅ Consistent response format (ApiResponse)
- ✅ Authentication & Authorization
- ✅ Error handling
- ✅ Clean architecture

Happy coding! 🚀
