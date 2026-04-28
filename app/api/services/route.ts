import { NextRequest, NextResponse } from 'next/server';
import { db, ServiceType, ServiceDetail } from '@/lib/db';

export async function GET() {
  return NextResponse.json({ serviceTypes: db.serviceTypes, channels: db.channels });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'addType') {
    const st: ServiceType = {
      id: `st${Date.now()}`,
      name: body.name,
      details: [],
    };
    db.addServiceType(st);
    return NextResponse.json({ serviceType: st });
  }

  if (action === 'addDetail') {
    const detail: ServiceDetail = {
      id: `sd${Date.now()}`,
      name: body.name,
      price: body.price,
    };
    db.addServiceDetail(body.typeId, detail);
    return NextResponse.json({ detail });
  }

  if (action === 'deleteType') {
    db.deleteServiceType(body.typeId);
    return NextResponse.json({ ok: true });
  }

  if (action === 'deleteDetail') {
    db.deleteServiceDetail(body.typeId, body.detailId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
