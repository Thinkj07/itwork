# ITViec - Nền tảng Tuyển dụng IT

Hệ thống tuyển dụng IT chuyên nghiệp được xây dựng với MERN Stack (MongoDB, Express.js, React.js, Node.js).

## 🚀 Cài đặt và chạy project

### Yêu cầu hệ thống

- Node.js v22.x
- npm v10.x
- MongoDB Atlas account (MongoDB không cần cài đặt)

### 1. Clone repository

```bash
git clone <repository-url>
cd itwork
```

### 2. Cài đặt dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 3. Cấu hình Environment Variables

Tạo file `.env` ở thư mục root:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/itwork?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

Tạo file `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Chạy ứng dụng

#### Development mode (chạy đồng thời Backend & Frontend)

```bash
npm run dev:all
```

#### Chạy riêng Backend

```bash
cd frontend
npm run dev
```

#### Chạy riêng Frontend

```bash
cd frontend
npm start
```

Ứng dụng sẽ chạy tại:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 👤 Tài khoản demo

### Ứng viên

- Email: candidate@gmail.com
- Password: 123qweasd

### Nhà tuyển dụng

- Email: employer@gmail.com
- Password: 123qweasd

### 🔐 Quản trị viên (Admin)

**Tạo tài khoản Admin:**

```bash
npm run seed:admin
```

- Email: admin@system.com
- Password: Admin@123456
- **⚠️ LƯU Ý:** Đổi mật khẩu sau lần đăng nhập đầu tiên!

**Truy cập Admin Panel:** http://localhost:3000/admin/dashboard

## 📝 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Users

- `GET /api/users/profile/:id` - Lấy profile user
- `PUT /api/users/profile` - Cập nhật profile
- `PUT /api/users/education` - Cập nhật học vấn
- `PUT /api/users/experience` - Cập nhật kinh nghiệm
- `POST /api/users/saved-jobs/:jobId` - Lưu/Bỏ lưu công việc
- `GET /api/users/saved-jobs` - Lấy danh sách công việc đã lưu

### Jobs

- `GET /api/jobs` - Lấy danh sách công việc (có filter)
- `GET /api/jobs/:id` - Lấy chi tiết công việc
- `POST /api/jobs` - Tạo công việc mới (Employer)
- `PUT /api/jobs/:id` - Cập nhật công việc (Employer)
- `DELETE /api/jobs/:id` - Xóa công việc (Employer)
- `GET /api/jobs/my-jobs` - Lấy công việc của employer

### Applications

- `POST /api/applications` - Ứng tuyển (Candidate)
- `GET /api/applications/my-applications` - Lấy đơn ứng tuyển của candidate
- `GET /api/applications/job/:jobId` - Lấy ứng viên của job (Employer)
- `PUT /api/applications/:id/status` - Cập nhật trạng thái (Employer)

### Companies

- `GET /api/companies` - Lấy danh sách công ty
- `GET /api/companies/:id` - Lấy thông tin công ty

### Reviews

- `POST /api/reviews` - Tạo đánh giá (Candidate)
- `GET /api/reviews/company/:companyId` - Lấy đánh giá của công ty
- `GET /api/reviews/my-reviews` - Lấy đánh giá của candidate

### 🔐 Admin (Quản trị viên)

- `GET /api/admin/dashboard/stats` - Thống kê tổng quan
- `GET /api/admin/dashboard/growth` - Dữ liệu tăng trưởng
- `GET /api/admin/users` - Quản lý users (search, filter, pagination)
- `PUT /api/admin/users/:id/toggle-status` - Khóa/Mở khóa user
- `DELETE /api/admin/users/:id` - Xóa user
- `GET /api/admin/jobs` - Quản lý jobs
- `PUT /api/admin/jobs/:id/status` - Duyệt/Từ chối job
- `DELETE /api/admin/jobs/:id` - Xóa job
- `GET /api/admin/audit-logs` - Xem lịch sử hành động

**📖 Xem hướng dẫn chi tiết:** [ADMIN_MODULE_GUIDE.md](./ADMIN_MODULE_GUIDE.md)
