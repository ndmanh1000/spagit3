import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') || new Date().toISOString().split('T')[0].substring(0, 7) + '-01';
  const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

  const orders = await db.getOrders();
  const transactions = await db.getTransactions();
  const customers = await db.getCustomers();

  const filteredOrders = orders.filter(o => o.date >= from && o.date <= to);
  const filteredTransactions = transactions.filter(t => t.date >= from && t.date <= to);

  const totalRevenue = filteredOrders.reduce((s, o) => s + o.actualPaid, 0);
  const totalDebt = filteredOrders.reduce((s, o) => s + o.debt, 0);
  const totalOrders = filteredOrders.length;
  const totalCustomers = new Set(filteredOrders.map(o => o.customerId)).size;

  // Revenue by day
  const byDay: Record<string, number> = {};
  filteredOrders.forEach(o => {
    byDay[o.date] = (byDay[o.date] || 0) + o.actualPaid;
  });

  // Revenue by service type
  const byService: Record<string, number> = {};
  filteredOrders.forEach(o => {
    o.services.forEach(s => {
      byService[s.typeName] = (byService[s.typeName] || 0) + s.total;
    });
  });

  // Revenue by channel
  const byChannel: Record<string, number> = {};
  filteredOrders.forEach(o => {
    if (o.channel) byChannel[o.channel] = (byChannel[o.channel] || 0) + o.actualPaid;
  });

  // Top customers
  const custMap: Record<string, { name: string; phone: string; spent: number; orders: number }> = {};
  filteredOrders.forEach(o => {
    if (!custMap[o.customerId]) custMap[o.customerId] = { name: o.customerName, phone: o.customerPhone, spent: 0, orders: 0 };
    custMap[o.customerId].spent += o.actualPaid;
    custMap[o.customerId].orders += 1;
  });
  const topCustomers = Object.values(custMap).sort((a, b) => b.spent - a.spent).slice(0, 10);

  // All customers with debt
  const debtCustomers = customers.filter(c => c.debt > 0);

  return NextResponse.json({
    totalRevenue,
    totalDebt,
    totalOrders,
    totalCustomers,
    byDay,
    byService,
    byChannel,
    topCustomers,
    debtCustomers,
    transactions: filteredTransactions,
  });
}
