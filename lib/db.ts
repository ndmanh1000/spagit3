import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data.json');

function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to save DB:', e);
  }
}

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load DB:', e);
  }
  return null;
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

// Global in-memory store
declare global {
  // eslint-disable-next-line no-var
  var __db: {
    customers: Customer[];
    orders: Order[];
    transactions: Transaction[];
    serviceTypes: ServiceType[];
    channels: string[];
  } | undefined;
}

function initDB() {
  if (global.__db) return global.__db;

  const saved = loadDB();
  if (saved) {
    global.__db = saved;
    return global.__db;
  }

  const serviceTypes: ServiceType[] = [
    {
      id: 'st1',
      name: 'Chăm Sóc Da Mặt',
      details: [
        { id: 'sd1', name: 'Basic Facial 60 phút', price: 350000 },
        { id: 'sd2', name: 'Premium Facial 90 phút', price: 550000 },
        { id: 'sd3', name: 'Trị Mụn Chuyên Sâu', price: 450000 },
        { id: 'sd4', name: 'Nâng Cơ RF', price: 800000 },
      ],
    },
    {
      id: 'st2',
      name: 'Triệt Lông',
      details: [
        { id: 'sd5', name: 'Triệt Lông Nách', price: 300000 },
        { id: 'sd6', name: 'Triệt Lông Chân (Full)', price: 1200000 },
        { id: 'sd7', name: 'Triệt Lông Bikini', price: 500000 },
        { id: 'sd8', name: 'Triệt Lông Tay (Full)', price: 900000 },
      ],
    },
    {
      id: 'st3',
      name: 'Massage & Thư Giãn',
      details: [
        { id: 'sd9', name: 'Massage Toàn Thân 60 phút', price: 400000 },
        { id: 'sd10', name: 'Massage Thụy Điển 90 phút', price: 650000 },
        { id: 'sd11', name: 'Đá Nóng Massage', price: 750000 },
      ],
    },
    {
      id: 'st4',
      name: 'Điều Trị Cơ Thể',
      details: [
        { id: 'sd12', name: 'Giảm Béo Vùng Bụng', price: 600000 },
        { id: 'sd13', name: 'Nâng Ngực Không Phẫu Thuật', price: 900000 },
        { id: 'sd14', name: 'Tắm Trắng Toàn Thân', price: 500000 },
      ],
    },
    {
      id: 'st5',
      name: 'Nail & Tóc',
      details: [
        { id: 'sd15', name: 'Làm Nail Tay + Chân', price: 350000 },
        { id: 'sd16', name: 'Uốn Tóc', price: 700000 },
        { id: 'sd17', name: 'Nhuộm Tóc', price: 800000 },
      ],
    },
  ];

  const customers: Customer[] = [
    { id: 'c1', name: 'Nguyễn Thị Lan', phone: '0901234567', createdAt: '2024-01-15', totalSpent: 5600000, debt: 0 },
    { id: 'c2', name: 'Trần Thị Mai', phone: '0912345678', createdAt: '2024-02-20', totalSpent: 3200000, debt: 500000 },
    { id: 'c3', name: 'Lê Thị Hoa', phone: '0923456789', createdAt: '2024-03-10', totalSpent: 8900000, debt: 0 },
  ];

  const orders: Order[] = [
    {
      id: 'o1',
      date: '2026-04-25',
      customerId: 'c1',
      customerName: 'Nguyễn Thị Lan',
      customerPhone: '0901234567',
      channel: 'Facebook',
      services: [
        { id: 'os1', typeId: 'st1', typeName: 'Chăm Sóc Da Mặt', detailId: 'sd2', detailName: 'Premium Facial 90 phút', sessions: 3, price: 550000, total: 1650000 },
      ],
      totalAmount: 1650000,
      discount: 0,
      discountType: 'VND',
      mustPay: 1650000,
      actualPaid: 1650000,
      debt: 0,
      note: '',
      status: 'paid',
      createdAt: '2026-04-25T10:00:00',
    },
    {
      id: 'o2',
      date: '2026-04-26',
      customerId: 'c2',
      customerName: 'Trần Thị Mai',
      customerPhone: '0912345678',
      channel: 'Zalo',
      services: [
        { id: 'os2', typeId: 'st2', typeName: 'Triệt Lông', detailId: 'sd6', detailName: 'Triệt Lông Chân (Full)', sessions: 1, price: 1200000, total: 1200000 },
      ],
      totalAmount: 1200000,
      discount: 0,
      discountType: 'VND',
      mustPay: 1200000,
      actualPaid: 700000,
      debt: 500000,
      note: 'Khách sẽ thanh toán phần còn lại sau',
      status: 'partial',
      createdAt: '2026-04-26T14:30:00',
    },
  ];

  const transactions: Transaction[] = [
    { id: 't1', date: '2026-04-25', customerId: 'c1', customerName: 'Nguyễn Thị Lan', customerPhone: '0901234567', amount: 1650000, type: 'payment', orderId: 'o1', note: 'Thanh toán đơn hàng Premium Facial', createdAt: '2026-04-25T10:05:00' },
    { id: 't2', date: '2026-04-26', customerId: 'c2', customerName: 'Trần Thị Mai', customerPhone: '0912345678', amount: 700000, type: 'payment', orderId: 'o2', note: 'Thanh toán một phần', createdAt: '2026-04-26T14:35:00' },
  ];

  global.__db = { customers, orders, transactions, serviceTypes, channels: ['Facebook', 'Zalo', 'TikTok', 'Instagram', 'Khách vãng lai', 'Giới thiệu'] };
  saveDB(global.__db);
  return global.__db;
}

export const db = {
  get customers() { return initDB().customers; },
  get orders() { return initDB().orders; },
  get transactions() { return initDB().transactions; },
  get serviceTypes() { return initDB().serviceTypes; },
  get channels() { return initDB().channels; },

  addOrder(order: Order) { initDB().orders.unshift(order); saveDB(global.__db); },
  addTransaction(tx: Transaction) { initDB().transactions.unshift(tx); saveDB(global.__db); },
  addCustomer(c: Customer) { initDB().customers.push(c); saveDB(global.__db); },

  findOrCreateCustomer(phone: string, name: string): Customer {
    const db = initDB();
    let customer = db.customers.find(c => c.phone === phone);
    if (!customer) {
      customer = {
        id: `c${Date.now()}`,
        name,
        phone,
        createdAt: new Date().toISOString().split('T')[0],
        totalSpent: 0,
        debt: 0,
      };
      db.customers.push(customer);
      saveDB(global.__db);
    } else {
      customer.name = name;
      saveDB(global.__db);
    }
    return customer;
  },

  updateCustomerAfterOrder(customerId: string, paid: number, debt: number) {
    const db = initDB();
    const c = db.customers.find(c => c.id === customerId);
    if (c) {
      c.totalSpent += paid;
      c.debt += debt;
      saveDB(global.__db);
    }
  },

  updateCustomerDebtAfterCollection(customerId: string, amount: number) {
    const db = initDB();
    const c = db.customers.find(c => c.id === customerId);
    if (c) {
      c.debt = Math.max(0, c.debt - amount);
      c.totalSpent += amount;
      saveDB(global.__db);
    }
  },

  addServiceType(st: ServiceType) { initDB().serviceTypes.push(st); saveDB(global.__db); },
  addServiceDetail(typeId: string, detail: ServiceDetail) {
    const st = initDB().serviceTypes.find(s => s.id === typeId);
    if (st) { st.details.push(detail); saveDB(global.__db); }
  },
  deleteServiceType(typeId: string) {
    const db = initDB();
    db.serviceTypes = db.serviceTypes.filter(s => s.id !== typeId);
    saveDB(global.__db);
  },
  deleteServiceDetail(typeId: string, detailId: string) {
    const st = initDB().serviceTypes.find(s => s.id === typeId);
    if (st) { st.details = st.details.filter(d => d.id !== detailId); saveDB(global.__db); }
  },
};
