"use client";
import { useState, useEffect, useCallback } from "react";
import { fmt, today, api } from "@/lib/utils";
import Toast from "./Toast";

interface ServiceType { id: string; name: string; details: { id: string; name: string; price: number }[]; }
interface SvcItem { id: string; typeId: string; typeName: string; detailId: string; detailName: string; sessions: number; price: number; total: number; }

const FL = ({ label, children, color }: { label: string; children: React.ReactNode; color?: string }) => (
  <div>
    <label className="field-label" style={color ? { color } : undefined}>{label}</label>
    {children}
  </div>
);

export default function POSPage() {
  const [date, setDate] = useState(today());
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [channel, setChannel] = useState("");
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [services, setServices] = useState<SvcItem[]>([{ id: "s0", typeId: "", typeName: "", detailId: "", detailName: "", sessions: 1, price: 0, total: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"VND" | "%">("VND");
  const [actualPaid, setActualPaid] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [suggestions, setSuggestions] = useState<{ name: string; phone: string; debt: number }[]>([]);
  const [showSug, setShowSug] = useState(false);

  useEffect(() => { api("/api/services").then(d => { setServiceTypes(d.serviceTypes); setChannels(d.channels); }); }, []);

  const totalAmount = services.reduce((s, sv) => s + sv.total, 0);
  const discountAmt = discountType === "%" ? Math.round(totalAmount * discount / 100) : (discount || 0);
  const mustPay = Math.max(0, totalAmount - discountAmt);
  const paid = parseFloat(actualPaid.replace(/[^0-9]/g, "")) || 0;
  const debt = Math.max(0, mustPay - paid);

  const lookup = useCallback((p: string) => {
    if (p.length < 5) { setSuggestions([]); return; }
    api(`/api/customers?q=${p}`).then(d => {
      setSuggestions(d.customers.slice(0, 5));
      setShowSug(d.customers.length > 0);
      if (d.customers.length === 1 && d.customers[0].phone === p) { setCustomerName(d.customers[0].name); setShowSug(false); }
    });
  }, []);

  const updateSvc = (idx: number, field: string, value: string | number) => {
    setServices(prev => {
      const next = [...prev]; const svc = { ...next[idx] };
      if (field === "typeId") { const st = serviceTypes.find(s => s.id === value); svc.typeId = value as string; svc.typeName = st?.name || ""; svc.detailId = ""; svc.detailName = ""; svc.price = 0; svc.total = 0; }
      else if (field === "detailId") { const st = serviceTypes.find(s => s.id === svc.typeId); const d = st?.details.find(d => d.id === value); svc.detailId = value as string; svc.detailName = d?.name || ""; svc.price = d?.price || 0; svc.total = svc.price * svc.sessions; }
      else if (field === "sessions") { svc.sessions = Number(value); svc.total = svc.price * svc.sessions; }
      next[idx] = svc; return next;
    });
  };

  const submit = async () => {
    if (!phone || !customerName) { setToast({ msg: "Vui lòng nhập SĐT và tên khách hàng", type: "error" }); return; }
    const validSvcs = services.filter(s => s.detailId);
    if (!validSvcs.length) { setToast({ msg: "Vui lòng chọn ít nhất 1 dịch vụ", type: "error" }); return; }
    setLoading(true);
    try {
      await api("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName, customerPhone: phone, channel, services: validSvcs, discount, discountType, actualPaid: paid, note, date }) });
      setToast({ msg: "Tạo đơn hàng thành công!", type: "success" });
      setPhone(""); setCustomerName(""); setChannel(""); setNote(""); setActualPaid(""); setDiscount(0);
      setServices([{ id: "s0", typeId: "", typeName: "", detailId: "", detailName: "", sessions: 1, price: 0, total: 0 }]);
    } catch (e) { setToast({ msg: String(e), type: "error" }); }
    finally { setLoading(false); }
  };

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Section 1 */}
      <div className="section-block">
        <div className="section-header">
          <div className="section-badge">1</div>
          <span className="section-title">Thông Tin Khách Hàng</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
          <FL label="Ngày tạo đơn"><input type="date" className="inp" value={date} onChange={e => setDate(e.target.value)} /></FL>
          <div style={{ position: "relative" }}>
            <FL label="SĐT Khách *">
              <input className="inp" placeholder="Nhập số điện thoại" value={phone}
                onChange={e => { setPhone(e.target.value); lookup(e.target.value); }}
                onBlur={() => setTimeout(() => setShowSug(false), 180)} />
            </FL>
            {showSug && (
              <div className="suggestion-box">
                {suggestions.map(c => (
                  <div key={c.phone} className="suggestion-item" onMouseDown={() => { setPhone(c.phone); setCustomerName(c.name); setShowSug(false); }}>
                    <strong style={{ color: "var(--rose)" }}>{c.phone}</strong>
                    <span style={{ color: "var(--text-3)", margin: "0 6px" }}>·</span>
                    {c.name}
                    {c.debt > 0 && <span className="badge badge-red" style={{ marginLeft: 8, fontSize: "0.6rem" }}>Nợ {fmt(c.debt)}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <FL label="Tên Khách Hàng *"><input className="inp" placeholder="Tên khách" value={customerName} onChange={e => setCustomerName(e.target.value)} /></FL>
          <FL label="Kênh Bán">
            <select className="inp" value={channel} onChange={e => setChannel(e.target.value)}>
              <option value="">— Chọn kênh —</option>
              {channels.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FL>
        </div>
      </div>

      {/* Section 2 */}
      <div className="section-block">
        <div className="section-header">
          <div className="section-badge">2</div>
          <span className="section-title">Chi Tiết Dịch Vụ</span>
          <button className="btn-outline" onClick={() => setServices(p => [...p, { id: `s${Date.now()}`, typeId: "", typeName: "", detailId: "", detailName: "", sessions: 1, price: 0, total: 0 }])} style={{ marginLeft: "auto", fontSize: "0.78rem", padding: "6px 14px" }}>
            + Thêm dịch vụ
          </button>
        </div>
        {services.map((svc, idx) => (
          <div key={svc.id} className="svc-row">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: "0.67rem", fontWeight: 700, color: "var(--rose)", background: "var(--rose-light)", padding: "2px 8px", borderRadius: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>Dịch vụ {idx + 1}</span>
              {services.length > 1 && <button className="btn-danger" onClick={() => setServices(p => p.filter((_, i) => i !== idx))} style={{ marginLeft: "auto", fontSize: "0.7rem" }}>✕ Xóa</button>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 12 }}>
              <FL label="Loại Dịch Vụ">
                <select className="inp" value={svc.typeId} onChange={e => updateSvc(idx, "typeId", e.target.value)}>
                  <option value="">— Chọn loại —</option>
                  {serviceTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                </select>
              </FL>
              <div style={{ gridColumn: "span 2" }}>
                <FL label="Chi Tiết Dịch Vụ">
                  <select className="inp" value={svc.detailId} onChange={e => updateSvc(idx, "detailId", e.target.value)} disabled={!svc.typeId}>
                    <option value="">— Chọn dịch vụ —</option>
                    {serviceTypes.find(s => s.id === svc.typeId)?.details.map(d => (
                      <option key={d.id} value={d.id}>{d.name} — {d.price.toLocaleString("vi-VN")}đ</option>
                    ))}
                  </select>
                </FL>
              </div>
              <FL label="Số buổi">
                <input type="number" className="inp" min={1} value={svc.sessions} onChange={e => updateSvc(idx, "sessions", e.target.value)} style={{ textAlign: "center" }} />
              </FL>
            </div>
            <FL label="Thành tiền">
              <div className="amount-display" style={{ color: svc.total > 0 ? "var(--rose)" : "var(--text-4)" }}>
                {svc.total > 0 ? fmt(svc.total) : "—"}
              </div>
            </FL>
          </div>
        ))}
      </div>

      {/* Section 3: Payment */}
      <div className="section-block">
        <div className="section-header">
          <div className="section-badge">3</div>
          <span className="section-title">Thanh Toán</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
          <FL label="Tổng tiền hàng">
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", padding: "9px 0" }}>{fmt(totalAmount)}</div>
          </FL>
          <div>
            <FL label="Giảm giá đơn">
              <div style={{ display: "flex", gap: 6 }}>
                <input type="number" className="inp" value={discount || ""} placeholder="0" onChange={e => setDiscount(Number(e.target.value))} style={{ flex: 1 }} />
                <select className="inp" value={discountType} onChange={e => setDiscountType(e.target.value as "VND" | "%")} style={{ width: 64 }}>
                  <option value="VND">VND</option><option value="%">%</option>
                </select>
              </div>
            </FL>
          </div>
          <FL label="Cần thu">
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--rose)", padding: "9px 0" }}>{fmt(mustPay)}</div>
          </FL>
          <FL label="Thực thu">
            <input className="inp" placeholder="Nhập số tiền" value={actualPaid} onChange={e => setActualPaid(e.target.value)}
              style={{ border: "1.5px solid var(--teal)", background: "var(--teal-light)" }} />
          </FL>
          <FL label="Còn nợ">
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: debt > 0 ? "var(--red)" : "var(--teal)", padding: "9px 0" }}>{fmt(debt)}</div>
          </FL>
        </div>
      </div>

      {/* Note */}
      <div className="section-block" style={{ padding: "16px 20px", marginBottom: 20 }}>
        <textarea className="inp" placeholder="📝  Ghi chú đơn hàng..." value={note} onChange={e => setNote(e.target.value)} style={{ minHeight: 60, fontSize: "0.84rem" }} />
      </div>

      <button className="btn-primary" onClick={submit} disabled={loading} style={{ width: "100%", padding: "13px", fontSize: "0.9rem", borderRadius: 11, justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8 2l6 6-6 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {loading ? "Đang xử lý..." : "Tạo Đơn Hàng"}
      </button>
    </div>
  );
}
