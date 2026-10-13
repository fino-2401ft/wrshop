# Hướng dẫn cài đặt & chạy wrshop trên máy mới

Hướng dẫn này giúp clone dự án về máy mới, kết nối Postgres, chạy backend + frontend và mở web ở local.

Dự án gồm **2 repo** (để cùng cấp thư mục):

```
Quocanh/
  wrshop/        ← frontend (web) + docker-compose Postgres
  wrshop_BE/     ← backend NestJS
```

---

## 1. Cài phần mềm cần thiết

| Phần mềm | Ghi chú |
|----------|---------|
| **Git** | Clone code |
| **Node.js 20+** | Chạy FE & BE (`node -v` kiểm tra) |
| **Docker Desktop** | Chạy Postgres (bật Docker trước khi `docker compose`) |

---

## 2. Clone code

Mở terminal tại thư mục bạn muốn đặt dự án (ví dụ `Documents\Quocanh`):

```bash
git clone https://github.com/fino-2401ft/wrshop.git
git clone https://github.com/fino-2401ft/wrshop_BE.git
```

Kiểm tra cấu trúc:

```text
wrshop/
  docker-compose.yml
  web/
wrshop_BE/
  package.json
  prisma/
```

---

## 3. Chạy database (Postgres)

Trong thư mục `wrshop`:

```bash
cd wrshop
docker compose up -d
```

Docker tạo Postgres với thông số:

| Thông số | Giá trị |
|----------|---------|
| User | `wrshop` |
| Password | `wrshop` |
| Database | `wrshop` |
| Port trên máy | **5433** (map từ 5432 trong container) |

Kiểm tra container đang chạy:

```bash
docker compose ps
```

---

## 4. Cấu hình & chạy Backend

```bash
cd wrshop_BE
copy .env.example .env
```

Trên macOS/Linux dùng: `cp .env.example .env`

Mở file `.env` và chỉnh (hoặc thay toàn bộ) thành:

```env
# Khớp docker-compose của wrshop (user/pass/db + cổng 5433)
DATABASE_URL=postgresql://wrshop:wrshop@localhost:5433/wrshop?schema=public

JWT_SECRET=doi-thanh-chuoi-ngau-nhien-dai
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
AUTH_SESSION_HOURS=8
COOKIE_SECURE=false
PORT=3000
PUBLIC_BASE_URL=http://localhost:3000
WEB_ORIGIN=http://localhost:5173
SEED_DEMO=true

# Để trống khi dev local: ảnh lưu trong thư mục uploads/
# Nếu có R2 (production), điền các biến R2_* như trên máy đang chạy shop
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=
```

> **Lưu ý:** File `.env.example` có thể ghi `postgres` / cổng `5432`. Khi dùng Docker của repo này, **bắt buộc** dùng `wrshop:wrshop@localhost:5433` như trên.

Cài dependency, tạo bảng, chạy server:

```bash
npm install
npm run db:push
npm run start:dev
```

Thành công khi terminal báo Nest đang listen (port **3000**).

Lần đầu với `SEED_DEMO=true`:

- Tạo tài khoản admin từ `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- Tạo danh mục + vài acc demo (nếu DB chưa có acc)

**Đăng nhập admin:** `admin` / `admin123` (đổi ngay nếu dùng thật).

Giữ cửa sổ terminal này mở.

---

## 5. Cấu hình & chạy Frontend

Mở terminal mới:

```bash
cd wrshop/web
copy .env.example .env
```

Nội dung `.env` (để trống là được — Vite proxy `/api` và `/uploads` sang backend):

```env
VITE_API_URL=
```

Cài và chạy:

```bash
npm install
npm run dev
```

Mở trình duyệt: **http://localhost:5173**

---

## 6. Kiểm tra nhanh

| Kiểm tra | Kết quả mong đợi |
|----------|------------------|
| http://localhost:5173 | Trang shop hiển thị |
| Có acc demo (nếu SEED_DEMO=true) | Card sản phẩm hiện ra |
| Vào trang admin, đăng nhập `admin` / `admin123` | Vào được khu quản trị |
| Upload ảnh mới (local, chưa R2) | Ảnh lưu vào `wrshop_BE/uploads/` và hiện trên web |

---

## 7. Muốn dùng đúng dữ liệu shop đang chạy (không chỉ demo)

Git **không** chứa database. Máy mới chỉ có schema trống + data demo.

Nếu cần copy data thật từ máy cũ:

1. **Máy cũ — xuất DB** (Postgres đang chạy, đúng user/db của máy đó):

   ```bash
   docker exec -t <ten_container_postgres> pg_dump -U wrshop wrshop > wrshop-data.sql
   ```

   Hoặc nếu Postgres cài trực tiếp trên Windows (không Docker), dùng `pg_dump` với user/port tương ứng.

2. Gửi file `wrshop-data.sql` cho máy mới (không commit lên Git nếu có thông tin nhạy cảm).

3. **Máy mới — import** (sau khi `docker compose up -d`):

   ```bash
   Get-Content wrshop-data.sql | docker exec -i <ten_container_postgres> psql -U wrshop -d wrshop
   ```

4. Nếu ảnh cũ lưu local: copy luôn thư mục `wrshop_BE/uploads/` từ máy cũ.

5. Đặt `SEED_DEMO=false` trong `.env` rồi chạy lại BE (tránh tạo thêm acc demo).

Nếu shop production đang dùng **Cloudflare R2**, trên máy mới cần điền đủ biến `R2_*` trong `.env` thì ảnh trên R2 mới tải được; không cần copy `uploads/` cho những ảnh đã lên R2.

---

## 8. Lệnh thường dùng sau này

```bash
# Postgres
cd wrshop
docker compose up -d
docker compose down

# Backend
cd wrshop_BE
npm run start:dev
npm run db:push

# Frontend
cd wrshop/web
npm run dev
```

Tắt web: `Ctrl + C` trong từng terminal.

---

## 9. Lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| Không kết nối được DB | Docker Desktop đã bật chưa? `docker compose ps` có chạy không? `DATABASE_URL` đúng cổng **5433** và user **wrshop**? |
| `password authentication failed` | Sai user/pass trong `DATABASE_URL` — phải khớp `docker-compose.yml` |
| FE gọi API lỗi / CORS | BE phải chạy ở port 3000; `WEB_ORIGIN=http://localhost:5173` |
| Trang admin không login được | DB đã có admin cũ (từ SQL import) → dùng mật khẩu cũ, không phải giá trị trong `.env`. `.env` chỉ tạo admin khi DB **chưa** có admin nào |
| Ảnh không hiện | Ảnh cũ URL `localhost/uploads` nhưng folder `uploads` trống → upload lại, hoặc copy lại `uploads/`, hoặc cấu hình R2 |
| Port 5173 / 3000 / 5433 bị chiếm | Đổi port hoặc tắt process đang dùng port đó |

---

## 10. Tóm tắt một lần (copy theo thứ tự)

```bash
# 1) DB
cd wrshop
docker compose up -d

# 2) BE
cd ../wrshop_BE
copy .env.example .env
# → sửa DATABASE_URL = postgresql://wrshop:wrshop@localhost:5433/wrshop?schema=public
npm install
npm run db:push
npm run start:dev

# 3) FE (terminal mới)
cd wrshop/web
copy .env.example .env
npm install
npm run dev
```

Mở: http://localhost:5173
