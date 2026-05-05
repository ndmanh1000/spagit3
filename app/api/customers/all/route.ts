import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const customers = await db.getCustomers();
  const sorted = customers.sort((a, b) => b.totalSpent - a.totalSpent);
  return NextResponse.json({ customers: sorted });
}
