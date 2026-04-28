"use client";
import { useState } from "react";
import { fmt } from "@/lib/utils";
interface Order { id: string; date: string; customerName: string; customerPhone: string; channel: string; services: { typeName: string; detailName: string; sessions: number; total: number }[]; totalAmount: number; discount: number; discountType: string; mustPay: number; actualPaid: number; debt: number; note: string; status: string; }
export default function HistoryPage() {
  const [phone, setPhone] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const search = () => { setLoading(true); setSearched(true); const p = new URLSearchParams(); if (phone) p.set("phone", phone); if (from) p.set("from", from); if (to) p.set("to", to); fetch(`/api/orders?${p}`).then(r => r.json()).then(d => { setOrders(d.orders); setLoading(false); }); };
  const badge = (s: string) => {
    const map: Record<string, { cls: string; label: string }> = { paid: { cls: "badge-green", label: "Đã TT" }, partial: { cls: "badge-yellow", label: "TT 1 phần" }, debt: { cls: "badge-red", label: "Còn nợ" } };
    const m = map[s] || { cls: "badge-blue", label: s };
    return <span className={`badge ${m.cls}`}>{m.label}</span>;
  };
  return (
    <div>
      <div className="filter-bar">
        <input className="inp" placeholder="🔍  SĐT khách hàng..." value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} style={{ width: 170 }} />
        <input type="date" className="inp" value={from} onChange={e => setFrom(e.target.value)} style={{ width: 145 }} />
        <span className="filter-sep">→</span>
        <input type="date" className="inp" value={to} onChange={e => setTo(e.target.value)} style={{ width: 145 }} />
        <button className="btn-primary" onClick={search} style={{ padding: "7px 16px", fontSize: "0.78rem" }}>Tra cứu</button>
        <button className="btn-ghost" onClick={() => { setPhone(""); setFrom(""); setTo(""); setOrders([]); setSearched(false); }}>Xóa</button>
      </div>
      {!searched && <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-4)" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: "0.85rem" }}>Nhập SĐT hoặc khoảng thời gian để tra cứu</div>
      </div>}
      {loading && <div style={{ textAlign: "center", padding: 60, color: "var(--text-4)" }}>Đang tìm...</div>}
      {searched && !loading && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 600 }}>Tìm thấy {orders.length} đơn hàng</div>
          {orders.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "var(--text-4)" }}>Không tìm thấy đơn hàng nào</div> :
            orders.map(o => (
              <div key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <div onClick={() => setExpanded(expanded === o.id ? null : o.id)} style={{ padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "background 0.12s" }} onMouseOver={e => (e.currentTarget.style.background = "var(--rose-light)")} onMouseOut={e => (e.currentTarget.style.background = "")}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, color: "var(--text-1)", fontSize: "0.88rem" }}>{o.customerName}</span>
                      <span style={{ color: "var(--text-3)", fontSize: "0.78rem", fontFamily: "monospace" }}>{o.customerPhone}</span>
                      {badge(o.status)}
                      {o.channel && <span className="badge badge-blue" style={{ fontSize: "0.62rem" }}>{o.channel}</span>}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
                      📅 {o.date} · {o.services.length} dịch vụ · <span style={{ color: "var(--rose)", fontWeight: 700 }}>{fmt(o.totalAmount)}</span>
                      {o.debt > 0 && <span style={{ color: "var(--red)", marginLeft: 8 }}>· Nợ: {fmt(o.debt)}</span>}
                    </div>
                  </div>
                  <span style={{ color: "var(--text-4)", fontSize: "0.8rem", transition: "transform 0.2s", transform: expanded === o.id ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                </div>
                {expanded === o.id && (
                  <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
                    <table className="tbl" style={{ marginTop: 12 }}>
                      <thead><tr><th>Dịch Vụ</th><th>Chi Tiết</th><th>Buổi</th><th>Thành Tiền</th></tr></thead>
                      <tbody>{o.services.map((s, i) => <tr key={i}><td>{s.typeName}</td><td>{s.detailName}</td><td style={{ textAlign: "center" }}>{s.sessions}</td><td style={{ fontWeight: 700, color: "var(--rose)" }}>{fmt(s.total)}</td></tr>)}</tbody>
                    </table>
                    <div style={{ marginTop: 12, display: "flex", gap: 20, fontSize: "0.78rem", flexWrap: "wrap" }}>
                      <div style={{ color: "var(--text-3)" }}>Tổng: <strong style={{ color: "var(--text-1)" }}>{fmt(o.totalAmount)}</strong></div>
                      {o.discount > 0 && <div style={{ color: "var(--text-3)" }}>Giảm: <strong style={{ color: "var(--purple)" }}>{o.discountType === "%" ? `${o.discount}%` : fmt(o.discount)}</strong></div>}
                      <div style={{ color: "var(--text-3)" }}>Cần thu: <strong style={{ color: "var(--text-1)" }}>{fmt(o.mustPay)}</strong></div>
                      <div style={{ color: "var(--text-3)" }}>Đã thu: <strong style={{ color: "var(--teal)" }}>{fmt(o.actualPaid)}</strong></div>
                      {o.debt > 0 && <div style={{ color: "var(--text-3)" }}>Nợ: <strong style={{ color: "var(--red)" }}>{fmt(o.debt)}</strong></div>}
                    </div>
                    {o.note && <div style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--text-4)", fontStyle: "italic" }}>📝 {o.note}</div>}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
