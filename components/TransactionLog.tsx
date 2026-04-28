"use client";
import { useState, useEffect } from "react";
import { fmt } from "@/lib/utils";
interface Tx { id: string; date: string; customerName: string; customerPhone: string; amount: number; type: "payment" | "debt_collection"; note: string; }
export default function TransactionLogPage() {
  const now = new Date();
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const [from, setFrom] = useState(firstDay);
  const [to, setTo] = useState(now.toISOString().split("T")[0]);
  const [phone, setPhone] = useState("");
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); const p = new URLSearchParams({ from, to }); if (phone) p.set("phone", phone); fetch(`/api/transactions?${p}`).then(r => r.json()).then(d => { setTxs(d.transactions); setLoading(false); }); };
  useEffect(() => { load(); }, []);// eslint-disable-line
  const total = txs.reduce((s, t) => s + t.amount, 0);
  const payments = txs.filter(t => t.type === "payment");
  const collections = txs.filter(t => t.type === "debt_collection");
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border border-[var(--border)] mb-5">
        <input type="date" className="inp text-xs" value={from} onChange={e => setFrom(e.target.value)} style={{ width: 130 }} />
        <span className="text-[var(--text-4)] text-xs">→</span>
        <input type="date" className="inp text-xs" value={to} onChange={e => setTo(e.target.value)} style={{ width: 130 }} />
        <input className="inp text-xs flex-1 min-w-[120px]" placeholder="SĐT khách..." value={phone} onChange={e => setPhone(e.target.value)} />
        <button className="btn-primary text-xs px-3 py-1.5" onClick={load}>Tìm kiếm</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Tổng Thu", value: fmt(total), color: "var(--teal)", bg: "var(--teal-light)", icon: "💰" },
          { label: "Thanh Toán Đơn", value: `${payments.length} giao dịch`, color: "var(--blue)", bg: "var(--blue-light)", icon: "💳" },
          { label: "Thu Tiền Nợ", value: `${collections.length} giao dịch`, color: "var(--purple)", bg: "var(--purple-light)", icon: "📌" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? <div style={{ textAlign: "center", padding: 60, color: "var(--text-4)" }}>Đang tải...</div> : (
          <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Ngày</th><th>Khách Hàng</th><th className="hidden sm:table-cell">SĐT</th><th className="hidden md:table-cell">Loại</th><th className="hidden lg:table-cell">Ghi Chú</th><th>Số Tiền</th></tr></thead>
            <tbody>
              {txs.map(t => (
                <tr key={t.id}>
                  <td style={{ color: "var(--text-3)", fontSize: "0.78rem", whiteSpace: "nowrap" }}>{t.date}</td>
                  <td style={{ fontWeight: 600, color: "var(--text-1)" }}>{t.customerName}</td>
                  <td className="hidden sm:table-cell" style={{ color: "var(--text-3)", fontFamily: "monospace", fontSize: "0.78rem" }}>{t.customerPhone}</td>
                  <td className="hidden md:table-cell"><span className={`badge ${t.type === "payment" ? "badge-blue" : "badge-purple"}`}>{t.type === "payment" ? "💳 Thanh toán" : "💰 Thu nợ"}</span></td>
                  <td className="hidden lg:table-cell" style={{ color: "var(--text-3)", fontSize: "0.78rem" }}>{t.note}</td>
                  <td style={{ fontWeight: 800, color: "var(--teal)", whiteSpace: "nowrap" }}>{fmt(t.amount)}</td>
                </tr>
              ))}
              {txs.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-4)" }}>Không có giao dịch nào</td></tr>}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
