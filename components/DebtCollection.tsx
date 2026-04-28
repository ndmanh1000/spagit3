"use client";
import { useState, useEffect } from "react";
import { fmt, today, api } from "@/lib/utils";
import Toast from "./Toast";
interface Customer { id: string; name: string; phone: string; debt: number; totalSpent: number; }
export default function DebtCollectionPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [key, setKey] = useState(0);
  useEffect(() => { api("/api/customers?q=").then(d => setCustomers(d.customers.filter((c: Customer) => c.debt > 0))); }, [key]);
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  const paid = parseFloat(amount.replace(/[^0-9]/g, "")) || 0;
  const collect = async () => {
    if (!selected) { setToast({ msg: "Chưa chọn khách hàng", type: "error" }); return; }
    if (paid <= 0) { setToast({ msg: "Nhập số tiền hợp lệ", type: "error" }); return; }
    if (paid > selected.debt) { setToast({ msg: `Vượt quá nợ (${fmt(selected.debt)})`, type: "error" }); return; }
    setLoading(true);
    try {
      await api("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerId: selected.id, customerName: selected.name, customerPhone: selected.phone, amount: paid, note: note || `Thu nợ từ ${selected.name}`, date }) });
      setToast({ msg: `Thu thành công ${fmt(paid)} từ ${selected.name}`, type: "success" });
      setSelected(null); setAmount(""); setNote(""); setKey(k => k + 1);
    } catch (e) { setToast({ msg: String(e), type: "error" }); }
    finally { setLoading(false); }
  };
  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left */}
        <div>
          <div className="card card-pad mb-4">
            <div className="flex items-center gap-2.5 mb-3.5">
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--red-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", fontSize: "1rem" }}>💸</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-1)" }}>Khách Còn Nợ</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{customers.length} khách hàng</div>
              </div>
            </div>
            <input className="inp mb-3" placeholder="🔍  Tìm theo tên hoặc SĐT..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="max-h-[420px] overflow-y-auto flex flex-col gap-1.5">
              {filtered.length === 0 && <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-4)", fontSize: "0.82rem" }}>🎉 Không có khách nào còn nợ</div>}
              {filtered.map(c => (
                <div key={c.id} onClick={() => { setSelected(c); setAmount(""); setNote(""); }}
                  className="p-3 rounded-lg cursor-pointer border transition-all"
                  style={{ border: selected?.id === c.id ? "1.5px solid var(--rose)" : "1px solid var(--border)", background: selected?.id === c.id ? "var(--rose-light)" : "var(--surface-2)" }}>
                  <div className="flex justify-between items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[0.85rem] truncate" style={{ color: "var(--text-1)" }}>{c.name}</div>
                      <div className="text-[0.75rem] mt-0.5 truncate" style={{ color: "var(--text-3)" }}>{c.phone}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-extrabold text-[0.9rem]" style={{ color: "var(--red)" }}>{fmt(c.debt)}</div>
                      <div className="text-[0.62rem]" style={{ color: "var(--red)", opacity: 0.7 }}>còn nợ</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Right */}
        <div className="card card-pad">
          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-1)", marginBottom: 20 }}>Thu Tiền</div>
          {!selected ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-4)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>←</div>
              <div style={{ fontSize: "0.82rem" }}>Chọn khách hàng ở danh sách bên trái</div>
            </div>
          ) : (
            <div>
              <div style={{ background: "var(--rose-light)", border: "1px solid rgba(212,84,122,0.15)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: "var(--text-1)", fontSize: "0.95rem" }}>{selected.name}</div>
                <div style={{ color: "var(--text-3)", fontSize: "0.8rem", marginTop: 2 }}>{selected.phone}</div>
                <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>Số tiền còn nợ</span>
                  <span style={{ fontWeight: 800, color: "var(--red)", fontSize: "1.05rem" }}>{fmt(selected.debt)}</span>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}><label className="field-label">Ngày thu</label><input type="date" className="inp" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div style={{ marginBottom: 8 }}><label className="field-label" style={{ color: "var(--teal)" }}>Số tiền thu *</label>
                <input className="inp" placeholder="Nhập số tiền" value={amount} onChange={e => setAmount(e.target.value)} style={{ border: "1.5px solid var(--teal)", background: "var(--teal-light)", fontWeight: 700, fontSize: "1rem" }} />
              </div>
              <div className="flex gap-1.5 mb-3.5 flex-wrap">
                {[selected.debt, Math.round(selected.debt / 2)].map(a => (
                  <button key={a} className="btn-ghost" onClick={() => setAmount(String(a))} style={{ fontSize: "0.72rem", padding: "5px 10px" }}>{fmt(a)}</button>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}><label className="field-label">Ghi chú</label><input className="inp" placeholder="Ghi chú..." value={note} onChange={e => setNote(e.target.value)} /></div>
              {paid > 0 && (
                <div style={{ background: "var(--teal-light)", border: "1px solid rgba(14,168,130,0.2)", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: "0.8rem" }}>
                  <div className="flex justify-between mb-1.5"><span style={{ color: "var(--text-3)" }}>Thu:</span><span style={{ fontWeight: 700, color: "var(--teal)" }}>{fmt(paid)}</span></div>
                  <div className="flex justify-between"><span style={{ color: "var(--text-3)" }}>Còn lại:</span><span style={{ fontWeight: 700, color: paid >= selected.debt ? "var(--teal)" : "var(--red)" }}>{fmt(Math.max(0, selected.debt - paid))}</span></div>
                </div>
              )}
              <button className="btn-teal w-full justify-center" onClick={collect} disabled={loading} style={{ padding: "12px", borderRadius: 10 }}>
                {loading ? "Đang xử lý..." : "✓  Xác Nhận Thu Tiền"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
