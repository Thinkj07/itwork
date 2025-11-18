# ITViec - Nền tảng Tuyển dụng IT

Hệ thống tuyển dụng IT chuyên nghiệp được xây dựng với MERN Stack (MongoDB, Express.js, React.js, Node.js).

## 📋 Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc project](#cấu-trúc-project)
- [Cài đặt và chạy project](#cài-đặt-và-chạy-project)
- [Tài khoản demo](#tài-khoản-demo)

## ✨ Tính năng chính

### 🔐 Hệ thống xác thực

- Đăng ký/Đăng nhập với Email & Password
- Lựa chọn vai trò: Ứng viên hoặc Nhà tuyển dụng
- JWT Authentication
- Protected Routes

### 👨‍💼 Dành cho ứng viên

- **Quản lý hồ sơ cá nhân**

  - Cập nhật thông tin cá nhân
  - Quản lý học vấn, kinh nghiệm, chứng chỉ
  - Upload CV
  - Quản lý kỹ năng

- **Tìm kiếm việc làm**

  - Tìm kiếm theo từ khóa, địa điểm, mức lương
  - Lọc theo danh mục, loại hình, kinh nghiệm
  - Xem chi tiết công việc
  - Lưu công việc yêu thích

- **Ứng tuyển**

  - Ứng tuyển bằng CV đã lưu hoặc upload CV mới
  - Viết cover letter
  - Theo dõi trạng thái đơn ứng tuyển
  - Nhận thông báo cập nhật trạng thái

- **Khác**
  - Theo dõi công ty
  - Đánh giá công ty (sau khi được tuyển)

### 🏢 Dành cho nhà tuyển dụng

- **Quản lý hồ sơ công ty**

  - Cập nhật thông tin công ty
  - Logo, website, quy mô
  - Mô tả công ty

- **Đăng tin tuyển dụng**

  - Tạo tin tuyển dụng mới
  - Chỉnh sửa/Xóa tin đăng
  - Đóng/Mở lại tin tuyển dụng
  - Quản lý danh sách tin đã đăng

- **Quản lý ứng viên**

  - Xem danh sách ứng viên theo từng công việc
  - Xem chi tiết hồ sơ ứng viên
  - Cập nhật trạng thái ứng tuyển (Pending, Reviewing, Interview, Rejected, Hired)
  - Xem CV của ứng viên

- **Thống kê**
  - Tổng số tin tuyển dụng
  - Số lượng ứng viên
  - Lượt xem công việc

## 🛠 Công nghệ sử dụng

### Backend

- **Node.js** v22.x
- **Express.js** - Web framework
- **MongoDB Atlas** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend

- **React** 18.x
- **React Router DOM** v6 - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **React Icons** - Icons

## 📁 Cấu trúc project

```
itwork/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── companyController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── companyRoutes.js
│   │   └── reviewRoutes.js
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   └── JobCard.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Jobs.js
│   │   │   ├── JobDetails.js
│   │   │   ├── Companies.js
│   │   │   ├── CompanyProfile.js
│   │   │   ├── candidate/
│   │   │   │   ├── Profile.js
│   │   │   │   ├── MyApplications.js
│   │   │   │   └── SavedJobs.js
│   │   │   └── employer/
│   │   │       ├── Dashboard.js
│   │   │       ├── Profile.js
│   │   │       ├── CreateJob.js
│   │   │       ├── ManageJobs.js
│   │   │       └── Applicants.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   └── useAuthStore.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Cài đặt và chạy project

### Yêu cầu hệ thống

- Node.js v22.x
- npm v10.x
- MongoDB Atlas account

### 1. Clone repository

```bash
git clone <repository-url>
cd itwork
```

### 2. Cài đặt dependencies

#### Cài đặt cho toàn bộ project

```bash
npm run install:all
```

Hoặc cài đặt riêng:

#### Backend

```bash
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 3. Cấu hình MongoDB Atlas

1. Tạo account tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster mới (Free tier)
3. Tạo database user
4. Whitelist IP address (0.0.0.0/0 cho development)
5. Lấy connection string

### 4. Cấu hình Environment Variables

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

### 5. Chạy ứng dụng

#### Development mode (chạy đồng thời Backend & Frontend)

```bash
npm run dev:all
```

#### Chạy riêng Backend

```bash
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

### 6. Build cho Production

```bash
cd frontend
npm run build
```

## 👤 Tài khoản demo

### Ứng viên

- Email: candidate@test.com
- Password: 123456

### Nhà tuyển dụng

- Email: employer@test.com
- Password: 123456

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

## 🎨 Screenshots

[Thêm screenshots của ứng dụng tại đây]

## 📄 License

MIT License

## 👨‍💻 Author

ITViec Development Team

---

**Note**: Đây là project học tập/demo. Không sử dụng cho mục đích thương mại.
