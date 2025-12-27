# Admin Module Refactoring - Cấu trúc mới

## 📋 Tổng quan
Đã refactor toàn bộ phần admin backend theo pattern **Controller -> Service -> Repository** chuẩn, tách biệt rõ ràng các layer:

- **Controller**: Xử lý HTTP request/response
- **Service**: Business logic và validation
- **Repository**: Truy vấn database

## 🗂️ Cấu trúc mới

### 1. Repository Layer (`adminRepository.js`)
**Chức năng**: Tất cả các database queries và operations

#### User Queries
- `getAllUsersWithStats()` - Lấy tất cả users kèm thống kê
- `getUserByIdWithStats(userId)` - Lấy user theo ID kèm stats
- `getRoomsByUserId(userId)` - Lấy rooms của user
- `findUserById(userId)` - Tìm user theo ID
- `updateUser(user, updateData)` - Cập nhật user
- `deleteUser(user)` - Xóa user

#### Room Queries
- `getAllRoomsWithStats()` - Lấy tất cả rooms kèm thống kê
- `getRoomByIdWithStats(roomId)` - Lấy room theo ID kèm stats
- `getRoomMembers(roomId)` - Lấy members của room
- `findRoomById(roomId)` - Tìm room theo ID
- `deleteRoom(room)` - Xóa room

#### Metrics Queries
- `getMetricsOverview()` - Lấy overview metrics
- `getMostActiveUser()` - Lấy user active nhất
- `getMessagesByDate(days)` - Lấy thống kê messages theo ngày

#### Auth Queries
- `findAdminByEmail(email)` - Tìm admin theo email
- `updateUserToken(user, token)` - Cập nhật token

### 2. Service Layer (`adminService.js`)
**Chức năng**: Business logic, validation, và data transformation

#### Auth Services
- `login(email, password)` - Xử lý login admin
  - Validate input
  - Verify credentials
  - Generate JWT tokens
  - Return user data

#### User Services
- `getAllUsers()` - Lấy danh sách users
- `getUserById(userId)` - Lấy chi tiết user
- `updateUserStatus(userId, status)` - Cập nhật trạng thái user
  - Validate status (ONLINE/OFFLINE)
- `deleteUser(userId)` - Xóa user
  - Prevent xóa admin accounts

#### Room Services
- `getAllRooms()` - Lấy danh sách rooms
- `getRoomById(roomId)` - Lấy chi tiết room
- `deleteRoom(roomId)` - Xóa room

#### Metrics Services
- `getMetricsOverview()` - Lấy dashboard metrics
- `getMessagesByDate(days)` - Lấy thống kê messages

### 3. Controller Layer
**Chức năng**: Handle HTTP requests và responses

#### `adminAuthController.js`
- `login()` - Admin login endpoint

#### `adminUserController.js`
- `getAllUsers()` - GET /api/admin/users
- `getUserById()` - GET /api/admin/users/:id
- `updateUserStatus()` - PUT /api/admin/users/:id/status
- `deleteUser()` - DELETE /api/admin/users/:id

#### `adminRoomController.js`
- `getAllRooms()` - GET /api/admin/rooms
- `getRoomById()` - GET /api/admin/rooms/:id
- `deleteRoom()` - DELETE /api/admin/rooms/:id

#### `adminMetricsController.js`
- `getMetricsOverview()` - GET /api/admin/metrics
- `getMessagesByDate()` - GET /api/admin/metrics/messages-by-date

## ✅ Cải tiến

### 1. Tách biệt Concerns
- Controller: Chỉ xử lý HTTP
- Service: Logic nghiệp vụ
- Repository: Database access

### 2. Reusability
- Các repository methods có thể tái sử dụng
- Service logic có thể gọi từ nhiều nơi

### 3. Testability
- Dễ dàng test từng layer riêng biệt
- Mock dependencies đơn giản

### 4. Maintainability
- Code sạch hơn, dễ đọc
- Dễ dàng thêm features mới
- Bug fix nhanh chóng

### 5. Error Handling
- Consistent error handling
- Proper HTTP status codes
- Meaningful error messages

## 🔄 Migration từ code cũ

### Trước (Old):
```javascript
// Controller chứa raw SQL
async getAllUsers(req, res) {
  const users = await sequelize.query(`SELECT...`);
  return ApiResponse.success(res, "...", { users });
}
```

### Sau (New):
```javascript
// Controller
async getAllUsers(req, res) {
  const result = await adminService.getAllUsers();
  return ApiResponse.success(res, "...", result);
}

// Service
async getAllUsers() {
  const users = await adminRepository.getAllUsersWithStats();
  return { users, total: users.length };
}

// Repository
async getAllUsersWithStats() {
  return await sequelize.query(`SELECT...`);
}
```

## 📊 Flow diagram

```
Request → Controller → Service → Repository → Database
                                      ↓
Response ← Controller ← Service ← Repository ← Data
```

## 🚀 Sử dụng

### Import Service
```javascript
const adminService = require("../services/adminService");
```

### Gọi Service Methods
```javascript
// Get all users
const result = await adminService.getAllUsers();

// Delete user
const deleted = await adminService.deleteUser(userId);

// Login
const authData = await adminService.login(email, password);
```

## 🛡️ Security & Validation

### Service Layer Validations:
- Email & password required
- Status validation (ONLINE/OFFLINE)
- Prevent admin deletion
- Proper error messages

### Repository Layer:
- Parameterized queries (SQL injection prevention)
- Cascade deletes handled properly

## 📝 Best Practices Applied

1. **Single Responsibility**: Mỗi layer có 1 trách nhiệm rõ ràng
2. **DRY**: Không lặp code, tái sử dụng functions
3. **Error Handling**: Consistent error handling ở mọi layer
4. **Naming Convention**: Clear và descriptive names
5. **Comments**: Document các functions quan trọng

## 🔜 Recommendations

1. **Add Unit Tests**: Test từng layer riêng
2. **Add Input Validation**: Sử dụng Joi hoặc express-validator
3. **Add Logging**: Winston hoặc Morgan cho better debugging
4. **Add Caching**: Redis cho frequently accessed data
5. **Add Pagination**: Cho getAllUsers và getAllRooms
6. **Add Filtering**: Query params cho filter/search
