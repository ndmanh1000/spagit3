import { NextRequest, NextResponse } from 'next/server';
import { db, Order } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let orders = [...db.orders];
  if (phone) orders = orders.filter(o => o.customerPhone.includes(phone));
  if (from) orders = orders.filter(o => o.date >= from);
  if (to) orders = orders.filter(o => o.date <= to);

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, channel, services, discount, discountType, actualPaid, note, date } = body;

    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: 'Thiếu thông tin khách hàng' }, { status: 400 });
    }
    if (!services || services.length === 0) {
      return NextResponse.json({ error: 'Chưa có dịch vụ' }, { status: 400 });
    }

    const customer = db.findOrCreateCustomer(customerPhone, customerName);
    const totalAmount = services.reduce((sum: number, s: { total: number }) => sum + s.total, 0);
    const discountAmount = discountType === '%' ? Math.round(totalAmount * discount / 100) : (discount || 0);
    const mustPay = Math.max(0, totalAmount - discountAmount);
    const paid = actualPaid || 0;
    const debt = Math.max(0, mustPay - paid);

    const order: Order = {
      id: `o${Date.now()}`,
      date: date || new Date().toISOString().split('T')[0],
      customerId: customer.id,
      customerName,
      customerPhone,
      channel: channel || '',
      services,
      totalAmount,
      discount: discount || 0,
      discountType: discountType || 'VND',
      mustPay,
      actualPaid: paid,
      debt,
      note: note || '',
      status: debt === 0 ? 'paid' : paid > 0 ? 'partial' : 'debt',
      createdAt: new Date().toISOString(),
    };

    db.addOrder(order);
    db.updateCustomerAfterOrder(customer.id, paid, debt);

    if (paid > 0) {
      db.addTransaction({
        id: `t${Date.now()}`,
        date: order.date,
        customerId: customer.id,
        customerName,
        customerPhone,
        amount: paid,
        type: 'payment',
        orderId: order.id,
        note: `Thanh toán đơn hàng ${order.id}`,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ order, customer });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
