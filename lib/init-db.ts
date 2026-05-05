import { Pool } from 'pg';

let initialized = false;

export async function initDatabase(pool: Pool) {
  if (initialized) return;

  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'customers'
      );
    `);

    if (result.rows[0]?.exists) {
      initialized = true;
      return;
    }

    console.log('Initializing database...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        created_at DATE NOT NULL,
        total_spent BIGINT DEFAULT 0,
        debt BIGINT DEFAULT 0
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_types (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_details (
        id VARCHAR(50) PRIMARY KEY,
        type_id VARCHAR(50) NOT NULL REFERENCES service_types(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price BIGINT NOT NULL
      );
    `);

    await pool.query(`
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
    `);

    await pool.query(`
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
    `);

    await pool.query(`
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
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS channels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      );
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_service_details_type_id ON service_details(type_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_order_services_order_id ON order_services(order_id);`);

    const serviceTypes = [
      { id: 'st1', name: 'Chăm Sóc Da Mặt' },
      { id: 'st2', name: 'Triệt Lông' },
      { id: 'st3', name: 'Massage & Thư Giãn' },
      { id: 'st4', name: 'Điều Trị Cơ Thể' },
      { id: 'st5', name: 'Nail & Tóc' }
    ];
    for (const st of serviceTypes) {
      await pool.query(
        `INSERT INTO service_types (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
        [st.id, st.name]
      );
    }

    const serviceDetails = [
      { id: 'sd1', type_id: 'st1', name: 'Basic Facial 60 phút', price: 350000 },
      { id: 'sd2', type_id: 'st1', name: 'Premium Facial 90 phút', price: 550000 },
      { id: 'sd3', type_id: 'st1', name: 'Trị Mụn Chuyên Sâu', price: 450000 },
      { id: 'sd4', type_id: 'st1', name: 'Nâng Cơ RF', price: 800000 },
      { id: 'sd5', type_id: 'st2', name: 'Triệt Lông Nách', price: 300000 },
      { id: 'sd6', type_id: 'st2', name: 'Triệt Lông Chân (Full)', price: 1200000 },
      { id: 'sd7', type_id: 'st2', name: 'Triệt Lông Bikini', price: 500000 },
      { id: 'sd8', type_id: 'st2', name: 'Triệt Lông Tay (Full)', price: 900000 },
      { id: 'sd9', type_id: 'st3', name: 'Massage Toàn Thân 60 phút', price: 400000 },
      { id: 'sd10', type_id: 'st3', name: 'Massage Thụy Điển 90 phút', price: 650000 },
      { id: 'sd11', type_id: 'st3', name: 'Đá Nóng Massage', price: 750000 },
      { id: 'sd12', type_id: 'st4', name: 'Giảm Béo Vùng Bụng', price: 600000 },
      { id: 'sd13', type_id: 'st4', name: 'Nâng Ngực Không Phẫu Thuật', price: 900000 },
      { id: 'sd14', type_id: 'st4', name: 'Tắm Trắng Toàn Thân', price: 500000 },
      { id: 'sd15', type_id: 'st5', name: 'Làm Nail Tay + Chân', price: 350000 },
      { id: 'sd16', type_id: 'st5', name: 'Uốn Tóc', price: 700000 },
      { id: 'sd17', type_id: 'st5', name: 'Nhuộm Tóc', price: 800000 }
    ];
    for (const sd of serviceDetails) {
      await pool.query(
        `INSERT INTO service_details (id, type_id, name, price) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
        [sd.id, sd.type_id, sd.name, sd.price]
      );
    }

    const channels = ['Facebook', 'Zalo', 'TikTok', 'Instagram', 'Khách vãng lai', 'Giới thiệu'];
    for (const channel of channels) {
      await pool.query(
        `INSERT INTO channels (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [channel]
      );
    }

    console.log('Database initialized successfully!');
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}
