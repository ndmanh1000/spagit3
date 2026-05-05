import { Pool } from 'pg';
import { initDatabase } from './init-db';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

let initPromise: Promise<void> | null = null;
let dbAvailable = true;

async function ensureInitialized() {
  if (!initPromise) {
    initPromise = initDatabase(pool).catch((err) => {
      console.error('Database not available, using mock data:', err.message);
      dbAvailable = false;
    });
  }
  await initPromise;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  totalSpent: number;
  debt: number;
}

export interface ServiceDetail {
  id: string;
  name: string;
  price: number;
}

export interface ServiceType {
  id: string;
  name: string;
  details: ServiceDetail[];
}

export interface OrderService {
  id: string;
  typeId: string;
  typeName: string;
  detailId: string;
  detailName: string;
  sessions: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  channel: string;
  services: OrderService[];
  totalAmount: number;
  discount: number;
  discountType: 'VND' | '%';
  mustPay: number;
  actualPaid: number;
  debt: number;
  note: string;
  status: 'paid' | 'partial' | 'debt';
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  type: 'payment' | 'debt_collection';
  orderId?: string;
  note: string;
  createdAt: string;
}

export const db = {
  async getCustomers(query?: string): Promise<Customer[]> {
    await ensureInitialized();
    if (!dbAvailable) {
      return [
        { id: 'c1', name: 'Nguyễn Thị Lan', phone: '0901234567', createdAt: '2024-01-15', totalSpent: 5600000, debt: 0 },
        { id: 'c2', name: 'Trần Thị Mai', phone: '0912345678', createdAt: '2024-02-20', totalSpent: 3200000, debt: 500000 }
      ];
    }
    if (query) {
      const q = `%${query.toLowerCase()}%`;
      const result = await pool.query(
        `SELECT id, name, phone, created_at as "createdAt", total_spent as "totalSpent", debt
         FROM customers
         WHERE LOWER(name) LIKE $1 OR phone LIKE $1
         ORDER BY created_at DESC`,
        [q]
      );
      return result.rows;
    }
    const result = await pool.query(
      `SELECT id, name, phone, created_at as "createdAt", total_spent as "totalSpent", debt
       FROM customers
       ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async getOrders(): Promise<Order[]> {
    await ensureInitialized();
    const ordersResult = await pool.query(
      `SELECT id, date, customer_id as "customerId", customer_name as "customerName",
             customer_phone as "customerPhone", channel, total_amount as "totalAmount",
             discount, discount_type as "discountType", must_pay as "mustPay",
             actual_paid as "actualPaid", debt, note, status, created_at as "createdAt"
       FROM orders
       ORDER BY created_at DESC`
    );

    const orders: Order[] = [];
    for (const order of ordersResult.rows) {
      const servicesResult = await pool.query(
        `SELECT id, type_id as "typeId", type_name as "typeName",
               detail_id as "detailId", detail_name as "detailName",
               sessions, price, total
         FROM order_services
         WHERE order_id = $1`,
        [order.id]
      );
      orders.push({
        ...order,
        services: servicesResult.rows
      } as Order);
    }
    return orders;
  },

  async getTransactions(): Promise<Transaction[]> {
    await ensureInitialized();
    const result = await pool.query(
      `SELECT id, date, customer_id as "customerId", customer_name as "customerName",
             customer_phone as "customerPhone", amount, type, order_id as "orderId",
             note, created_at as "createdAt"
       FROM transactions
       ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async getServiceTypes(): Promise<ServiceType[]> {
    await ensureInitialized();
    const typesResult = await pool.query(
      `SELECT id, name
       FROM service_types
       ORDER BY id`
    );

    const serviceTypes: ServiceType[] = [];
    for (const type of typesResult.rows) {
      const detailsResult = await pool.query(
        `SELECT id, name, price
         FROM service_details
         WHERE type_id = $1
         ORDER BY id`,
        [type.id]
      );
      serviceTypes.push({
        id: type.id,
        name: type.name,
        details: detailsResult.rows
      });
    }
    return serviceTypes;
  },

  async getChannels(): Promise<string[]> {
    await ensureInitialized();
    const result = await pool.query(
      `SELECT name
       FROM channels
       ORDER BY id`
    );
    return result.rows.map(r => r.name);
  },

  async addOrder(order: Order): Promise<void> {
    await ensureInitialized();
    await pool.query(
      `INSERT INTO orders (id, date, customer_id, customer_name, customer_phone, channel,
                          total_amount, discount, discount_type, must_pay, actual_paid,
                          debt, note, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [order.id, order.date, order.customerId, order.customerName, order.customerPhone,
       order.channel, order.totalAmount, order.discount, order.discountType, order.mustPay,
       order.actualPaid, order.debt, order.note, order.status, order.createdAt]
    );

    for (const service of order.services) {
      await pool.query(
        `INSERT INTO order_services (id, order_id, type_id, type_name, detail_id,
                                    detail_name, sessions, price, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [service.id, order.id, service.typeId, service.typeName, service.detailId,
         service.detailName, service.sessions, service.price, service.total]
      );
    }
  },

  async addTransaction(tx: Transaction): Promise<void> {
    await ensureInitialized();
    await pool.query(
      `INSERT INTO transactions (id, date, customer_id, customer_name, customer_phone,
                                amount, type, order_id, note, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [tx.id, tx.date, tx.customerId, tx.customerName, tx.customerPhone,
       tx.amount, tx.type, tx.orderId || null, tx.note, tx.createdAt]
    );
  },

  async addCustomer(c: Customer): Promise<void> {
    await ensureInitialized();
    await pool.query(
      `INSERT INTO customers (id, name, phone, created_at, total_spent, debt)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [c.id, c.name, c.phone, c.createdAt, c.totalSpent, c.debt]
    );
  },

  async findOrCreateCustomer(phone: string, name: string): Promise<Customer> {
    await ensureInitialized();
    const existing = await pool.query(
      `SELECT id, name, phone, created_at as "createdAt", total_spent as "totalSpent", debt
       FROM customers
       WHERE phone = $1`,
      [phone]
    );

    if (existing.rows.length > 0) {
      const customer = existing.rows[0];
      if (customer.name !== name) {
        await pool.query(
          `UPDATE customers SET name = $1 WHERE phone = $2`,
          [name, phone]
        );
        customer.name = name;
      }
      return customer;
    }

    const newCustomer: Customer = {
      id: `c${Date.now()}`,
      name,
      phone,
      createdAt: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      debt: 0,
    };

    await pool.query(
      `INSERT INTO customers (id, name, phone, created_at, total_spent, debt)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [newCustomer.id, newCustomer.name, newCustomer.phone,
       newCustomer.createdAt, newCustomer.totalSpent, newCustomer.debt]
    );

    return newCustomer;
  },

  async updateCustomerAfterOrder(customerId: string, paid: number, debt: number): Promise<void> {
    await ensureInitialized();
    await pool.query(
      `UPDATE customers
       SET total_spent = total_spent + $1,
           debt = debt + $2
       WHERE id = $3`,
      [paid, debt, customerId]
    );
  },

  async updateCustomerDebtAfterCollection(customerId: string, amount: number): Promise<void> {
    await ensureInitialized();
    await pool.query(
      `UPDATE customers
       SET debt = GREATEST(0, debt - $1),
           total_spent = total_spent + $1
       WHERE id = $2`,
      [amount, customerId]
    );
  },

  async addServiceType(st: ServiceType): Promise<void> {
    await ensureInitialized();
    await pool.query(
      `INSERT INTO service_types (id, name) VALUES ($1, $2)`,
      [st.id, st.name]
    );
  },

  async addServiceDetail(typeId: string, detail: ServiceDetail): Promise<void> {
    await ensureInitialized();
    await pool.query(
      `INSERT INTO service_details (id, type_id, name, price) VALUES ($1, $2, $3, $4)`,
      [detail.id, typeId, detail.name, detail.price]
    );
  },

  async deleteServiceType(typeId: string): Promise<void> {
    await ensureInitialized();
    await pool.query(
      `DELETE FROM service_types WHERE id = $1`,
      [typeId]
    );
  },

  async deleteServiceDetail(typeId: string, detailId: string): Promise<void> {
    await ensureInitialized();
    await pool.query(
      `DELETE FROM service_details WHERE type_id = $1 AND id = $2`,
      [typeId, detailId]
    );
  },
};
