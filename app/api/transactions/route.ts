import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const phone = searchParams.get('phone');

  let txs = await db.getTransactions();
  if (phone) txs = txs.filter(t => t.customerPhone.includes(phone));
  if (from) txs = txs.filter(t => t.date >= from);
  if (to) txs = txs.filter(t => t.date <= to);

  return NextResponse.json({ transactions: txs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, customerName, customerPhone, amount, note, date } = body;

    if (!customerId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Thiếu thông tin thu tiền nợ' }, { status: 400 });
    }

    const tx = {
      id: `t${Date.now()}`,
      date: date || new Date().toISOString().split('T')[0],
      customerId,
      customerName,
      customerPhone,
      amount,
      type: 'debt_collection' as const,
      note: note || 'Thu tiền nợ',
      createdAt: new Date().toISOString(),
    };

    await db.addTransaction(tx);
    await db.updateCustomerDebtAfterCollection(customerId, amount);

    return NextResponse.json({ transaction: tx });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
