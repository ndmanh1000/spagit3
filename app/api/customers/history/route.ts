import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone');

  if (!phone) {
    return NextResponse.json({ error: 'Missing phone' }, { status: 400 });
  }

  const orders = db.orders
    .filter(o => o.customerPhone === phone)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(o => ({
      id: o.id,
      date: o.date,
      services: o.services.map(s => ({
        typeName: s.typeName,
        detailName: s.detailName,
        sessions: s.sessions,
        total: s.total
      })),
      totalAmount: o.totalAmount,
      actualPaid: o.actualPaid,
      debt: o.debt
    }));

  return NextResponse.json({ orders });
}
