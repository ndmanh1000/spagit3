# 🌸 Pyna Spa - Hệ Thống Quản Trị

Hệ thống quản lý spa đầy đủ tính năng, xây dựng với **Next.js 14 + Tailwind CSS**.

## ✅ Tính Năng

| Module | Mô Tả |
|--------|-------|
| 🛒 **Bán Hàng (POS)** | Tạo đơn hàng, tìm khách tự động, nhiều dịch vụ, giảm giá, tính nợ |
| 💰 **Thu Tiền Nợ** | Danh sách khách còn nợ, thu từng phần hoặc toàn bộ |
| 📊 **Doanh Thu & Khách Hàng** | Biểu đồ theo ngày/dịch vụ/kênh, top khách hàng |
| 📋 **Nhật Ký Giao Dịch** | Lọc theo ngày, SĐT, phân loại giao dịch |
| 📌 **Quản Lý Công Nợ** | Tổng hợp toàn bộ công nợ |
| 🔍 **Tra Cứu Lịch Sử** | Tìm kiếm đơn hàng, xem chi tiết |
| ⚙️ **Quản Lý Danh Mục** | CRUD loại dịch vụ, chi tiết, giá |

## 🚀 Cài Đặt & Chạy

```bash
# Cài dependencies
npm install

# Chạy dev
npm run dev
# → http://localhost:3000

# Build production
npm run build
npm start
```

## 📁 Cấu Trúc

```
app/
├── api/
│   ├── orders/       # API đơn hàng
│   ├── customers/    # API khách hàng
│   ├── services/     # API dịch vụ (CRUD)
│   ├── transactions/ # API giao dịch
│   └── revenue/      # API báo cáo doanh thu
├── globals.css       # Design system
├── layout.tsx
└── page.tsx
components/           # Tất cả UI components
lib/
├── db.ts            # In-memory database (thay bằng DB thật khi deploy)
└── utils.tsx        # Helpers
```

## 🗄️ Database

Hiện tại dùng **in-memory store** (dữ liệu reset khi restart server).

Để dùng thật, thay `lib/db.ts` bằng:
- **PostgreSQL** + Prisma: `npm install prisma @prisma/client`
- **MongoDB** + Mongoose: `npm install mongoose`
- **Google Sheets API**: dùng googleapis

## 🎨 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Fonts**: Be Vietnam Pro + Playfair Display
- **Backend**: Next.js API Routes (App Router)
- **Database**: In-memory (production: PostgreSQL/MongoDB)
