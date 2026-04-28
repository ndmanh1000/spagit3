import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Không có file' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    let imported = 0;
    let skipped = 0;

    for (const row of data as any[]) {
      const phone = String(row['SĐT'] || row['SDT'] || row['Phone'] || '').trim();
      const name = String(row['Tên'] || row['Ten'] || row['Name'] || '').trim();
      const totalSpent = Number(row['Tổng Chi'] || row['Tong Chi'] || row['Total Spent'] || 0);
      const debt = Number(row['Công Nợ'] || row['Cong No'] || row['Debt'] || 0);
      const services = String(row['Dịch Vụ'] || row['Dich Vu'] || row['Services'] || '').trim();
      const date = String(row['Ngày'] || row['Ngay'] || row['Date'] || new Date().toISOString().split('T')[0]).trim();

      if (!phone || !name) {
        skipped++;
        continue;
      }

      const exists = db.customers.find(c => c.phone === phone);
      if (!exists) {
        const customer = {
          id: `c${Date.now()}_${imported}`,
          name,
          phone,
          createdAt: new Date().toISOString().split('T')[0],
          totalSpent,
          debt,
        };
        db.addCustomer(customer);

        if (services && totalSpent > 0) {
          const order = {
            id: `o${Date.now()}_${imported}`,
            date,
            customerId: customer.id,
            customerName: name,
            customerPhone: phone,
            channel: 'Import Excel',
            services: [{
              id: `os${Date.now()}_${imported}`,
              typeId: '',
              typeName: 'Lịch sử',
              detailId: '',
              detailName: services,
              sessions: 1,
              price: totalSpent,
              total: totalSpent
            }],
            totalAmount: totalSpent,
            discount: 0,
            discountType: 'VND' as const,
            mustPay: totalSpent,
            actualPaid: totalSpent - debt,
            debt,
            note: 'Import từ dữ liệu cũ',
            status: debt > 0 ? 'partial' as const : 'paid' as const,
            createdAt: new Date().toISOString(),
          };
          db.addOrder(order);
        }

        imported++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({ success: true, imported, skipped });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
