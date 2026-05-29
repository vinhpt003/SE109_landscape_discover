# WanderShare — Backend

NestJS + Prisma + PostgreSQL (Prisma Postgres managed)

---

## Yêu cầu

- Node.js >= 18
- npm >= 9

---

## Cài đặt

```bash
npm install
```

---

## Cấu hình môi trường


```env
DATABASE_URL="postgres://..."   # pooled URL — dùng cho app runtime
DIRECT_URL="postgres://..."     # direct URL — dùng cho migration
JWT_SECRET="..."
PORT=3000
```

> Nếu cần thay database mới, cập nhật cả hai biến `DATABASE_URL` và `DIRECT_URL`.

---

## Khởi chạy

### Development (watch mode — tự reload khi sửa code)

```bash
npm run start:dev
```

Server khởi động tại: `http://localhost:3000`

### Production

```bash
npm run build
npm run start:prod
```

---

## Database

### Đẩy schema lên database (lần đầu hoặc sau khi sửa `schema.prisma`)

```bash
npx prisma db push
```

> Lệnh này đồng bộ schema trong `prisma/schema.prisma` với database thật. Dùng `DIRECT_URL` để kết nối trực tiếp (bỏ qua connection pooler).

### Seed dữ liệu mẫu

```bash
npm run seed
```

Seed sẽ **xóa toàn bộ data cũ** rồi tạo lại:

| Role | userName | password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Editor | `editor_viet` | `editor123` |
| Editor | `editor_mai` | `editor123` |
| RegisteredUser | `traveler_hung` | `user123` |
| RegisteredUser | `traveler_linh` | `user123` |

Kèm theo: 8 địa điểm, 12 bài viết (11 Publish + 1 Pending), comments, ratings, saved posts.

> Để chạy lại seed bất cứ lúc nào (reset toàn bộ data về mẫu):
> ```bash
> npm run seed
> ```

---

## Xem database trực quan — Prisma Studio

Prisma Studio là giao diện web để xem và chỉnh sửa dữ liệu trong database, không cần dùng SQL.

### Khởi chạy Prisma Studio

```bash
npx prisma studio
```

Trình duyệt sẽ tự mở tại: `http://localhost:5555`

### Cách dùng

1. Chọn bảng ở cột bên trái (User, Post, Location, Comment, Rating, SavedPost)
2. Xem, lọc, sắp xếp dữ liệu trực tiếp trên giao diện
3. Click vào một record để xem chi tiết và các quan hệ liên kết
4. Có thể thêm/sửa/xóa record thủ công ngay trên UI

> Prisma Studio dùng `DIRECT_URL` để kết nối — chạy song song với server không ảnh hưởng gì.

---

## API Endpoints

Tất cả endpoints đều có prefix gốc `http://localhost:3000`.

### Auth

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/auth/register` | Đăng ký tài khoản mới (RegisteredUser) | — |
| POST | `/auth/login` | Đăng nhập (email hoặc userName + password) | — |

**Body đăng nhập:**
```json
{ "identifier": "admin", "password": "admin123" }
```

**Body đăng ký:**
```json
{ "userName": "myname", "email": "me@example.com", "password": "123456" }
```

### Users

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/users/me` | Thông tin user hiện tại | Bearer token |
| PATCH | `/users/me` | Cập nhật thông tin cá nhân | Bearer token |

### Locations

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/locations` | Danh sách địa điểm | — |
| GET | `/locations/:id` | Chi tiết địa điểm | — |
| POST | `/locations` | Tạo địa điểm mới | Admin |

### Posts

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/posts` | Danh sách bài viết (mặc định chỉ Publish) | — |
| GET | `/posts?status=Pending` | Lọc theo trạng thái | — |
| GET | `/posts?search=hội an` | Tìm kiếm theo tiêu đề/nội dung | — |
| GET | `/posts/:id` | Chi tiết bài viết (kèm comments, avgRating) | — |
| POST | `/posts` | Tạo bài viết (Draft) | Editor / Admin |
| PATCH | `/posts/:id` | Cập nhật nội dung | Tác giả / Admin |
| PATCH | `/posts/:id/status` | Duyệt / từ chối bài | Admin |
| DELETE | `/posts/:id` | Xóa bài viết | Tác giả / Admin |

**PostStatus:** `Draft` → `Pending` → `Publish` hoặc `Rejected`

### Comments

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/comments?postId=<uuid>` | Bình luận theo bài viết | — |
| POST | `/comments` | Đăng bình luận | Bearer token |
| DELETE | `/comments/:id` | Xóa bình luận | Chủ sở hữu / Admin |

### Ratings

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/ratings/summary/:postId` | Điểm TB + số lượng đánh giá | — |
| POST | `/ratings` | Tạo hoặc cập nhật đánh giá (1–5) | Bearer token |

### Saved Posts

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/saved-posts/me` | Danh sách bài đã lưu | Bearer token |
| POST | `/saved-posts` | Toggle lưu / bỏ lưu bài viết | Bearer token |

---

## Cấu trúc thư mục

```
backend/
├── prisma/
│   ├── schema.prisma       # Định nghĩa 6 models: User, Location, Post, Comment, Rating, SavedPost
│   └── seed.ts             # Script tạo dữ liệu mẫu
├── src/
│   ├── auth/               # JWT auth, guards, strategy, decorators
│   ├── users/              # GET/PATCH /users/me
│   ├── locations/          # CRUD địa điểm
│   ├── posts/              # CRUD bài viết + duyệt bài
│   ├── comments/           # Bình luận
│   ├── ratings/            # Đánh giá điểm
│   ├── saved-posts/        # Bookmark bài viết
│   └── prisma/             # PrismaService (singleton client)
├── .env                    # Biến môi trường (không commit lên git)
└── prisma.config.ts        # Cấu hình Prisma CLI (url + directUrl)
```

---

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run start:dev` | Chạy server development (watch mode) |
| `npm run build` | Build TypeScript sang JavaScript |
| `npm run start:prod` | Chạy server production |
| `npm run seed` | Seed dữ liệu mẫu vào database |
| `npx prisma db push` | Đồng bộ schema lên database |
| `npx prisma studio` | Mở Prisma Studio tại localhost:5555 |
| `npm run test` | Chạy unit tests |
