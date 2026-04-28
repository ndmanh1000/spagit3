import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase() || '';
  const customers = db.customers.filter(c =>
    c.name.toLowerCase().includes(q) || c.phone.includes(q)
  );
  return NextResponse.json({ customers });
}
