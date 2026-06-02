# 🌿 Landscape Discover

Ứng dụng web cho phép người dùng khám phá, chia sẻ và đánh giá các địa danh, cảnh quan thiên nhiên tại Việt Nam. Người dùng có thể đăng bài viết, bình luận, đánh giá và lưu lại những địa điểm yêu thích.

---

## 📋 Mục lục

- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Biến môi trường](#-biến-môi-trường)
- [Các lệnh hữu ích](#-các-lệnh-hữu-ích)
- [Phân quyền người dùng](#-phân-quyền-người-dùng)
- [Mô hình dữ liệu](#-mô-hình-dữ-liệu)

---

## ✨ Tính năng chính

- **Khám phá địa điểm**: Duyệt và tìm kiếm các địa danh cảnh quan theo vùng miền (Bắc – Trung – Nam).
- **Bài viết & Chia sẻ**: Người dùng có quyền Editor/Admin có thể tạo, chỉnh sửa và đăng bài viết trải nghiệm kèm hình ảnh.
- **Bình luận & Đánh giá**: Người dùng đã đăng nhập có thể bình luận và chấm điểm đánh giá cho từng bài viết.
- **Lưu bài viết**: Lưu lại những bài viết yêu thích để xem lại sau.
- **Thông báo**: Nhận thông báo khi bài viết được duyệt, bị từ chối, hoặc có bình luận mới.
- **Quản trị (Admin)**: Duyệt bài viết, quản lý địa điểm, người dùng và bình luận thông qua trang Admin.

---

## 🛠 Công nghệ sử dụng

### Backend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| Node.js | ≥ 18 | Runtime |
| NestJS | ^11 | Framework backend |
| TypeScript | ^5.7 | Ngôn ngữ lập trình |
| Prisma | ^6 | ORM kết nối database |
| PostgreSQL | — | Cơ sở dữ liệu quan hệ |
| JWT (Passport) | — | Xác thực và phân quyền |
| Cloudinary | ^2 | Lưu trữ và quản lý hình ảnh |
| Jest | ^30 | Unit & E2E testing |

### Frontend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| React | ^18.3 | Thư viện UI |
| TypeScript | ^5.5 | Ngôn ngữ lập trình |
| Vite | ^5 | Công cụ build |
| Tailwind CSS | ^3.4 | Framework CSS |
| React Router | ^6 | Định tuyến phía client |
| TanStack Query | ^5 | Quản lý state bất đồng bộ |
| Zustand | ^4 | Quản lý global state |
| Axios | ^1.7 | HTTP client |
| Vitest | ^4 | Testing framework |

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────┐        HTTP/REST         ┌──────────────────────┐
│      Frontend        │  ─────────────────────►  │       Backend         │
│  React + Vite        │                          │    NestJS + Prisma    │
│  (Vercel)            │  ◄─────────────────────  │    (Node.js)          │
└─────────────────────┘        JSON Response      └──────────┬───────────┘
                                                             │
                                                    ┌────────▼────────┐
                                              ┌─────┤   PostgreSQL     │
                                              │     └─────────────────┘
                                              │
                                              │     ┌─────────────────┐
                                              └─────┤   Cloudinary     │
                                                    │  (Image Storage) │
                                                    └─────────────────┘
```

---

## 📁 Cấu trúc thư mục

```
SE109_landscape_discover/
├── backend/                    # Mã nguồn backend (NestJS)
│   ├── prisma/
│   │   ├── schema.prisma       # Định nghĩa schema cơ sở dữ liệu
│   │   └── seed.ts             # Script khởi tạo dữ liệu mẫu
│   ├── src/
│   │   ├── auth/               # Module xác thực (đăng nhập, đăng ký, JWT)
│   │   ├── users/              # Module quản lý người dùng
│   │   ├── posts/              # Module quản lý bài viết
│   │   ├── comments/           # Module quản lý bình luận
│   │   ├── locations/          # Module quản lý địa điểm
│   │   ├── ratings/            # Module quản lý đánh giá
│   │   ├── saved-posts/        # Module lưu bài viết yêu thích
│   │   ├── notifications/      # Module thông báo
│   │   ├── stats/              # Module thống kê
│   │   ├── cloudinary/         # Module tích hợp Cloudinary
│   │   ├── prisma/             # Prisma Service
│   │   ├── main.ts             # Entry point của ứng dụng
│   │   └── app.module.ts       # Root Module
│   ├── test/                   # E2E tests
│   ├── .env.example            # Mẫu biến môi trường
│   └── package.json
│
├── frontend/                   # Mã nguồn frontend (React + Vite)
│   ├── src/
│   │   ├── components/         # Component UI tái sử dụng
│   │   │   ├── ui/             # Component cơ bản (Button, Input...)
│   │   │   ├── common/         # Component chung (Navbar, Footer...)
│   │   │   ├── layouts/        # Bố cục trang
│   │   │   ├── auth/           # Component xác thực
│   │   │   ├── forms/          # Component biểu mẫu
│   │   │   ├── landmarks/      # Component địa danh
│   │   │   └── notifications/  # Component thông báo
│   │   ├── pages/              # Các trang của ứng dụng
│   │   │   ├── Home/           # Trang chủ
│   │   │   ├── LandmarkDetail/ # Chi tiết địa danh
│   │   │   ├── Login/          # Đăng nhập
│   │   │   ├── Register/       # Đăng ký
│   │   │   ├── Profile/        # Trang cá nhân
│   │   │   ├── MyPosts/        # Quản lý bài đăng
│   │   │   ├── SavedPosts/     # Bài viết đã lưu
│   │   │   ├── Search/         # Tìm kiếm
│   │   │   └── Admin/          # Trang quản trị
│   │   ├── services/           # API services (Axios)
│   │   ├── store/              # Global state (Zustand)
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── types/              # TypeScript type definitions
│   │   ├── assets/             # Hình ảnh, icon tĩnh
│   │   ├── styles/             # File CSS toàn cục
│   │   ├── main.tsx            # Entry point React
│   │   └── App.tsx             # Root component & định tuyến
│   ├── .env.example            # Mẫu biến môi trường
│   └── package.json
│
└── README.md
```

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** (hoặc kết nối đến một database PostgreSQL từ xa)

### 1. Clone repository

```bash
git clone https://github.com/<your-org>/SE109_landscape_discover.git
cd SE109_landscape_discover
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

Sao chép file biến môi trường và điền thông tin cấu hình:

```bash
cp .env.example .env
# Chỉnh sửa file .env với thông tin database, JWT secret, Cloudinary...
```

Chạy migration và seed dữ liệu mẫu:

```bash
npx prisma migrate dev
npm run seed
```

Khởi động server backend (development):

```bash
npm run start:dev
```

> Backend sẽ chạy tại: `http://localhost:3000`

### 3. Cài đặt Frontend

```bash
cd ../frontend
npm install
```

Sao chép file biến môi trường:

```bash
cp .env.example .env.development
# Chỉnh sửa VITE_API_BASE_URL nếu backend chạy ở cổng khác
```

Khởi động server frontend (development):

```bash
npm run dev
```

> Frontend sẽ chạy tại: `http://localhost:5173`

---

## 🔐 Biến môi trường

### Backend (`.env`)

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `DATABASE_URL` | Connection string PostgreSQL (pooled) | `postgres://user:pass@host:5432/db?sslmode=require` |
| `DIRECT_URL` | Connection string PostgreSQL (direct) | `postgres://user:pass@host:5432/db?sslmode=require` |
| `JWT_SECRET` | Khóa bí mật để ký JWT token | `your-secret-key` |
| `PORT` | Cổng chạy backend | `3000` |
| `CORS_ORIGIN` | Các origin được phép truy cập | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Cloud name từ Cloudinary Console | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | API Key từ Cloudinary | `123456789` |
| `CLOUDINARY_API_SECRET` | API Secret từ Cloudinary | `your-api-secret` |
| `CLOUDINARY_UPLOAD_PRESET` | Upload preset của Cloudinary | `ml_default` |

### Frontend (`.env.development`)

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `VITE_API_BASE_URL` | URL gốc của backend API | `http://localhost:3000` |
| `VITE_APP_NAME` | Tên hiển thị của ứng dụng | `Landscape Discover` |

---

## 📜 Các lệnh hữu ích

### Backend

```bash
npm run start:dev       # Khởi động ở chế độ development (hot-reload)
npm run start:prod      # Khởi động ở chế độ production
npm run build           # Biên dịch TypeScript sang JavaScript
npm run test            # Chạy unit tests
npm run test:e2e        # Chạy end-to-end tests
npm run test:cov        # Chạy tests với báo cáo độ phủ code
npm run seed            # Seed dữ liệu mẫu vào database
npm run lint            # Kiểm tra và tự sửa lỗi ESLint
```

### Frontend

```bash
npm run dev             # Khởi động server development
npm run build           # Build production bundle
npm run preview         # Xem trước bản build production
npm run test            # Chạy tests (Vitest)
npm run lint            # Kiểm tra lỗi ESLint
```

---

## 👥 Phân quyền người dùng

| Role | Mô tả | Quyền hạn |
|------|-------|-----------|
| `RegisteredUser` | Người dùng thông thường | Xem bài viết, bình luận, đánh giá, lưu bài |
| `Editor` | Biên tập viên | Tất cả quyền của RegisteredUser + Tạo/chỉnh sửa bài viết |
| `Admin` | Quản trị viên | Tất cả quyền + Duyệt/từ chối bài, quản lý người dùng, địa điểm, bình luận |

---

## 🗄 Mô hình dữ liệu

Hệ thống sử dụng **PostgreSQL** với **Prisma ORM**. Các thực thể chính bao gồm:

```
User ──────── Post ──────── Comment
  │              │
  │              ├─────── Rating
  │              │
  │              └─────── SavedPost
  │
  └──────────── Notification

Location ─── Post
```

| Thực thể | Mô tả |
|----------|-------|
| `User` | Tài khoản người dùng (tên, email, mật khẩu, role, avatar) |
| `Location` | Địa điểm/địa danh cảnh quan (tên, mô tả, tọa độ, vùng miền) |
| `Post` | Bài viết chia sẻ trải nghiệm (tiêu đề, nội dung, hình ảnh, trạng thái) |
| `Comment` | Bình luận của người dùng trên bài viết |
| `Rating` | Đánh giá điểm số của người dùng cho bài viết |
| `SavedPost` | Bảng liên kết lưu bài viết yêu thích |
| `Notification` | Thông báo hệ thống gửi đến người dùng |
