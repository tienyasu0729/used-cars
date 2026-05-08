# API Contract - BanXeOTo Da Nang

Tài liệu mô tả các API endpoint được sử dụng bởi frontend.

## Authentication APIs

### POST /auth/login
Đăng nhập hệ thống.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "u1",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "phone": "0905123456",
    "role": "Customer"
  },
  "token": "jwt-token-string"
}
```

### POST /auth/register
Đăng ký tài khoản mới.

**Request:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0905123456",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Tài khoản đã tạo. Vui lòng kiểm tra email xác thực."
}
```

### POST /auth/forgot-password
Yêu cầu reset mật khẩu.

**Request:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password
Đặt lại mật khẩu qua token.

**Request:**
```json
{
  "token": "reset-token",
  "password": "newPassword123"
}
```

---

## Vehicle APIs

### GET /vehicles
Lấy danh sách xe.

**Query Parameters:**
- page: number
- limit: number
- brand: string
- minPrice: number
- maxPrice: number
- minYear: number
- maxYear: number

**Response:**
```json
{
  "data": [
    {
      "id": "v1",
      "brand": "Toyota",
      "model": "Camry",
      "year": 2020,
      "price": 850000000,
      "mileage": 45000,
      "fuelType": "Gasoline",
      "transmission": "Automatic",
      "status": "Available",
      "branchId": "branch1",
      "images": ["url1", "url2"]
    }
  ],
  "total": 120
}
```

### GET /vehicles/:id
Lấy chi tiết xe.

**Response:**
```json
{
  "id": "v1",
  "brand": "Toyota",
  "model": "Camry",
  "year": 2020,
  "price": 850000000,
  "mileage": 45000,
  "fuelType": "Gasoline",
  "transmission": "Automatic",
  "status": "Available",
  "branchId": "branch1",
  "images": [],
  "trim": "2.5Q",
  "exteriorColor": "Đen",
  "interiorColor": "Đen",
  "description": ""
}
```

---

## Branch APIs

### GET /branches
Lấy danh sách chi nhánh.

**Response:**
```json
[
  {
    "id": "branch1",
    "name": "Chi Nhánh Hải Châu",
    "address": "123 Nguyễn Văn Linh",
    "phone": "0236 123 4567",
    "lat": 16.0544,
    "lng": 108.2022,
    "openTime": "08:00",
    "closeTime": "18:00",
    "workingDays": "Thứ 2 - Thứ 7"
  }
]
```

### GET /branches/:id
Lấy chi tiết chi nhánh.

---

## Booking APIs

### POST /bookings
Tạo lịch lái thử.

### GET /bookings
Lấy danh sách lịch hẹn.

---

## Deposit APIs

### POST /deposits
Tạo đặt cọc.

### GET /deposits
Lấy danh sách đặt cọc.

---

## Order APIs

### GET /orders
Lấy danh sách đơn hàng.

### POST /orders
Tạo đơn hàng.

---

## User APIs

### GET /users/me
Lấy thông tin user hiện tại.

---

## Chat APIs

### GET /chat/conversations
Lấy danh sách hội thoại.

### POST /chat/messages
Gửi tin nhắn.

---

## Notification APIs

### GET /notifications
Lấy danh sách thông báo.
