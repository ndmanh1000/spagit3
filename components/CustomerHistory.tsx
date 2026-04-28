"use client";
import { useState, useEffect } from "react";
import { fmt } from "@/lib/utils";

interface Order {
  id: string;
  date: string;
  services: { typeName: string; detailName: string; sessions: number; total: number }[];
  totalAmount: number;
  actualPaid: number;
  debt: number;
}

export default function CustomerHistory({ phone, name, onClose }: { phone: string; name: string; onClose: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/history?phone=${phone}`)
      .then(r => r.json())
      .then(d => { setOrders(d.orders); setLoading(false); });
  }, [phone]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="modal-title">{name}</div>
            <div className="text-xs text-[var(--text-3)]">{phone}</div>
          </div>
          <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text-1)]">✕</button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-[var(--text-4)]">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-4)]">Chưa có lịch sử sử dụng dịch vụ</div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {orders.map(o => (
              <div key={o.id} className="border border-[var(--border)] rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-[var(--text-3)]">{o.date}</span>
                  <span className="text-sm font-bold text-[var(--rose)]">{fmt(o.totalAmount)}</span>
                </div>
                {o.services.map((s, i) => (
                  <div key={i} className="text-xs text-[var(--text-2)] mb-1">
                    • {s.typeName} - {s.detailName} ({s.sessions} buổi)
                  </div>
                ))}
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="text-[var(--teal)]">Đã thu: {fmt(o.actualPaid)}</span>
                  {o.debt > 0 && <span className="text-[var(--red)]">Nợ: {fmt(o.debt)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
