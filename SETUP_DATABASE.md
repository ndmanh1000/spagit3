# Hướng Dẫn Setup Database Postgres cho Vercel

## Bước 1: Tạo Database trên Vercel

1. Truy cập: https://vercel.com/dashboard
2. Chọn project của bạn (pyna-spa)
3. Vào tab **Storage**
4. Click **Create Database**
5. Chọn **Postgres** (powered by Neon)
6. Đặt tên database (ví dụ: `pyna-spa-db`)
7. Chọn region gần bạn nhất (khuyên dùng Singapore cho Việt Nam)
8. Click **Create**

Vercel sẽ tự động tạo các environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

## Bước 2: Chạy Migration để Tạo Tables

Sau khi database được tạo, bạn cần chạy SQL migration để tạo các bảng.

### Cách 1: Sử dụng Vercel Dashboard (Khuyên dùng)

1. Trong tab **Storage**, click vào database vừa tạo
2. Vào tab **Query**
3. Copy toàn bộ nội dung file `lib/init-db.sql`
4. Paste vào query editor
5. Click **Run Query**

### Cách 2: Sử dụng Neon Console

1. Trong Vercel Storage dashboard, click **Open in Neon**
2. Vào tab **SQL Editor**
3. Copy toàn bộ nội dung file `lib/init-db.sql`
4. Paste và chạy

### Cách 3: Sử dụng Local (nếu có psql)

```bash
# Lấy connection string từ Vercel dashboard
psql "YOUR_POSTGRES_URL" < lib/init-db.sql
```

## Bước 3: Test Local (Optional)

Nếu muốn test local trước khi deploy:

1. Tạo file `.env.local` trong root project:
```env
POSTGRES_URL="postgresql://..."
```

2. Copy connection string từ Vercel dashboard vào

3. Chạy dev server:
```bash
npm run dev
```

4. Mở http://localhost:3000 và test các chức năng

## Bước 4: Deploy lên Vercel

```bash
git add .
git commit -m "Tích hợp Postgres database"
git push
```

Vercel sẽ tự động deploy. Environment variables đã được setup sẵn nên không cần config gì thêm.

## Kiểm Tra Sau Khi Deploy

1. Mở app trên Vercel
2. Thử thêm khách hàng mới
3. Thử thêm dịch vụ mới
4. Đợi vài phút rồi refresh trang
5. **Dữ liệu phải vẫn còn đó!** ✅

## Troubleshooting

### Lỗi: "POSTGRES_URL is not defined"

- Kiểm tra xem database đã được tạo trong Vercel Storage chưa
- Kiểm tra environment variables trong Settings > Environment Variables
- Redeploy project

### Lỗi: "relation does not exist"

- Bạn chưa chạy migration (file init-db.sql)
- Chạy lại SQL trong Vercel Query hoặc Neon Console

### Dữ liệu vẫn bị mất

- Kiểm tra xem có đang dùng đúng POSTGRES_URL không
- Kiểm tra logs trong Vercel dashboard
- Đảm bảo đã deploy code mới nhất

## Lưu Ý Quan Trọng

- **Neon Free Tier**: 
  - 0.5 GB storage
  - 1 project
  - Đủ cho hầu hết spa nhỏ và vừa
  
- **Backup**: Neon tự động backup, nhưng nên export data định kỳ

- **Performance**: Database ở Singapore sẽ nhanh hơn cho người dùng Việt Nam

## Nâng Cấp (Nếu Cần)

Nếu cần nhiều storage hoặc performance tốt hơn:
1. Vào Neon dashboard
2. Upgrade plan (từ $19/tháng)
3. Hoặc chuyển sang Supabase/PlanetScale
