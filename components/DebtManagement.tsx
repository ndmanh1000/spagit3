"use client";
import { useState, useEffect } from "react";
import { fmt } from "@/lib/utils";
interface Customer { id: string; name: string; phone: string; debt: number; totalSpent: number; createdAt: string; }
export default function DebtManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/customers?q=").then(r => r.json()).then(d => { setCustomers(d.customers.filter((c: Customer) => c.debt > 0)); setLoading(false); }); }, []);
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  const totalDebt = customers.reduce((s, c) => s + c.debt, 0);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="stat-card" style={{ borderTop: "3px solid var(--red)" }}>
          <div className="stat-card-icon" style={{ background: "var(--red-light)", color: "var(--red)" }}>📌</div>
          <div className="stat-label">Tổng Công Nợ</div>
          <div className="stat-value" style={{ color: "var(--red)" }}>{fmt(totalDebt)}</div>
        </div>
        <div className="stat-card" style={{ borderTop: "3px solid var(--amber)" }}>
          <div className="stat-card-icon" style={{ background: "var(--amber-light)", color: "var(--amber)" }}>👥</div>
          <div className="stat-label">Số Khách Nợ</div>
          <div className="stat-value" style={{ color: "var(--amber)" }}>{customers.length} khách</div>
        </div>
      </div>
      <div className="card card-pad">
        <input className="inp mb-4" placeholder="🔍  Tìm theo tên hoặc SĐT..." value={search} onChange={e => setSearch(e.target.value)} />
        {loading ? <div style={{ textAlign: "center", padding: 60, color: "var(--text-4)" }}>Đang tải...</div> : (
          <div className="overflow-x-auto -mx-6 md:mx-0">
          <table className="tbl">
            <thead><tr><th>Khách Hàng</th><th className="hidden sm:table-cell">SĐT</th><th className="hidden md:table-cell">Ngày Tạo</th><th className="hidden lg:table-cell">Tổng Đã Chi</th><th>Công Nợ</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-1)" }}>{c.name}</td>
                  <td className="hidden sm:table-cell" style={{ color: "var(--text-3)", fontFamily: "monospace", fontSize: "0.8rem" }}>{c.phone}</td>
                  <td className="hidden md:table-cell" style={{ color: "var(--text-3)", fontSize: "0.78rem" }}>{c.createdAt}</td>
                  <td className="hidden lg:table-cell" style={{ fontWeight: 600, color: "var(--teal)" }}>{fmt(c.totalSpent)}</td>
                  <td><span style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--red)" }}>{fmt(c.debt)}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--teal)" }}>🎉 {search ? "Không tìm thấy" : "Không có công nợ!"}</td></tr>}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
