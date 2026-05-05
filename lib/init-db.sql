-- Tạo bảng customers
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  created_at DATE NOT NULL,
  total_spent BIGINT DEFAULT 0,
  debt BIGINT DEFAULT 0
);

-- Tạo bảng service_types
CREATE TABLE IF NOT EXISTS service_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Tạo bảng service_details
CREATE TABLE IF NOT EXISTS service_details (
  id VARCHAR(50) PRIMARY KEY,
  type_id VARCHAR(50) NOT NULL REFERENCES service_types(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price BIGINT NOT NULL
);

-- Tạo bảng orders
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  date DATE NOT NULL,
  customer_id VARCHAR(50) NOT NULL REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  channel VARCHAR(100) NOT NULL,
  total_amount BIGINT NOT NULL,
  discount BIGINT DEFAULT 0,
  discount_type VARCHAR(10) DEFAULT 'VND',
  must_pay BIGINT NOT NULL,
  actual_paid BIGINT NOT NULL,
  debt BIGINT DEFAULT 0,
  note TEXT,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- Tạo bảng order_services
CREATE TABLE IF NOT EXISTS order_services (
  id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type_id VARCHAR(50) NOT NULL,
  type_name VARCHAR(255) NOT NULL,
  detail_id VARCHAR(50) NOT NULL,
  detail_name VARCHAR(255) NOT NULL,
  sessions INT NOT NULL,
  price BIGINT NOT NULL,
  total BIGINT NOT NULL
);

-- Tạo bảng transactions
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(50) PRIMARY KEY,
  date DATE NOT NULL,
  customer_id VARCHAR(50) NOT NULL REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  amount BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  order_id VARCHAR(50),
  note TEXT,
  created_at TIMESTAMP NOT NULL
);

-- Tạo bảng channels
CREATE TABLE IF NOT EXISTS channels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Thêm dữ liệu mẫu cho service_types
INSERT INTO service_types (id, name) VALUES
  ('st1', 'Chăm Sóc Da Mặt'),
  ('st2', 'Triệt Lông'),
  ('st3', 'Massage & Thư Giãn'),
  ('st4', 'Điều Trị Cơ Thể'),
  ('st5', 'Nail & Tóc')
ON CONFLICT (id) DO NOTHING;

-- Thêm dữ liệu mẫu cho service_details
INSERT INTO service_details (id, type_id, name, price) VALUES
  ('sd1', 'st1', 'Basic Facial 60 phút', 350000),
  ('sd2', 'st1', 'Premium Facial 90 phút', 550000),
  ('sd3', 'st1', 'Trị Mụn Chuyên Sâu', 450000),
  ('sd4', 'st1', 'Nâng Cơ RF', 800000),
  ('sd5', 'st2', 'Triệt Lông Nách', 300000),
  ('sd6', 'st2', 'Triệt Lông Chân (Full)', 1200000),
  ('sd7', 'st2', 'Triệt Lông Bikini', 500000),
  ('sd8', 'st2', 'Triệt Lông Tay (Full)', 900000),
  ('sd9', 'st3', 'Massage Toàn Thân 60 phút', 400000),
  ('sd10', 'st3', 'Massage Thụy Điển 90 phút', 650000),
  ('sd11', 'st3', 'Đá Nóng Massage', 750000),
  ('sd12', 'st4', 'Giảm Béo Vùng Bụng', 600000),
  ('sd13', 'st4', 'Nâng Ngực Không Phẫu Thuật', 900000),
  ('sd14', 'st4', 'Tắm Trắng Toàn Thân', 500000),
  ('sd15', 'st5', 'Làm Nail Tay + Chân', 350000),
  ('sd16', 'st5', 'Uốn Tóc', 700000),
  ('sd17', 'st5', 'Nhuộm Tóc', 800000)
ON CONFLICT (id) DO NOTHING;

-- Thêm dữ liệu mẫu cho customers
INSERT INTO customers (id, name, phone, created_at, total_spent, debt) VALUES
  ('c1', 'Nguyễn Thị Lan', '0901234567', '2024-01-15', 5600000, 0),
  ('c2', 'Trần Thị Mai', '0912345678', '2024-02-20', 3200000, 500000),
  ('c3', 'Lê Thị Hoa', '0923456789', '2024-03-10', 8900000, 0)
ON CONFLICT (id) DO NOTHING;

-- Thêm dữ liệu mẫu cho channels
INSERT INTO channels (name) VALUES
  ('Facebook'),
  ('Zalo'),
  ('TikTok'),
  ('Instagram'),
  ('Khách vãng lai'),
  ('Giới thiệu')
ON CONFLICT (name) DO NOTHING;

-- Thêm dữ liệu mẫu cho orders
INSERT INTO orders (id, date, customer_id, customer_name, customer_phone, channel, total_amount, discount, discount_type, must_pay, actual_paid, debt, note, status, created_at) VALUES
  ('o1', '2026-04-25', 'c1', 'Nguyễn Thị Lan', '0901234567', 'Facebook', 1650000, 0, 'VND', 1650000, 1650000, 0, '', 'paid', '2026-04-25 10:00:00'),
  ('o2', '2026-04-26', 'c2', 'Trần Thị Mai', '0912345678', 'Zalo', 1200000, 0, 'VND', 1200000, 700000, 500000, 'Khách sẽ thanh toán phần còn lại sau', 'partial', '2026-04-26 14:30:00')
ON CONFLICT (id) DO NOTHING;

-- Thêm dữ liệu mẫu cho order_services
INSERT INTO order_services (id, order_id, type_id, type_name, detail_id, detail_name, sessions, price, total) VALUES
  ('os1', 'o1', 'st1', 'Chăm Sóc Da Mặt', 'sd2', 'Premium Facial 90 phút', 3, 550000, 1650000),
  ('os2', 'o2', 'st2', 'Triệt Lông', 'sd6', 'Triệt Lông Chân (Full)', 1, 1200000, 1200000)
ON CONFLICT (id) DO NOTHING;

-- Thêm dữ liệu mẫu cho transactions
INSERT INTO transactions (id, date, customer_id, customer_name, customer_phone, amount, type, order_id, note, created_at) VALUES
  ('t1', '2026-04-25', 'c1', 'Nguyễn Thị Lan', '0901234567', 1650000, 'payment', 'o1', 'Thanh toán đơn hàng Premium Facial', '2026-04-25 10:05:00'),
  ('t2', '2026-04-26', 'c2', 'Trần Thị Mai', '0912345678', 700000, 'payment', 'o2', 'Thanh toán một phần', '2026-04-26 14:35:00')
ON CONFLICT (id) DO NOTHING;

-- Tạo indexes để tăng performance
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_service_details_type_id ON service_details(type_id);
CREATE INDEX IF NOT EXISTS idx_order_services_order_id ON order_services(order_id);
