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

  const formatMoney = (val: string) => {
    const num = val.replace(/[^0-9]/g, "");
    return num ? parseInt(num).toLocaleString("vi-VN") : "";
  };

  const handlePaidChange = (val: string) => {
    setActualPaid(formatMoney(val));
  };

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
    if (paid > mustPay) { setToast({ msg: "Số tiền thực thu không được lớn hơn số tiền cần thu", type: "error" }); return; }
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
    <div className="pb-4">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Section 1 */}
      <div className="section-block">
        <div className="section-header">
          <div className="section-badge">1</div>
          <span className="section-title">Thông Tin Khách Hàng</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <FL label="Ngày tạo đơn"><input type="date" className="inp" value={date} onChange={e => setDate(e.target.value)} /></FL>
          <div className="relative">
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
                    {c.debt > 0 && <span className="badge badge-red ml-2 text-[0.6rem]">Nợ {fmt(c.debt)}</span>}
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
        <div className="section-header flex-wrap gap-2">
          <div className="section-badge">2</div>
          <span className="section-title">Chi Tiết Dịch Vụ</span>
          <button className="btn-outline ml-auto text-[0.78rem] px-3 py-1.5" onClick={() => setServices(p => [...p, { id: `s${Date.now()}`, typeId: "", typeName: "", detailId: "", detailName: "", sessions: 1, price: 0, total: 0 }])}>
            + Thêm dịch vụ
          </button>
        </div>
        {services.map((svc, idx) => (
          <div key={svc.id} className="svc-row">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-[0.67rem] font-bold text-[var(--rose)] bg-[var(--rose-light)] px-2 py-0.5 rounded uppercase tracking-wide">Dịch vụ {idx + 1}</span>
              {services.length > 1 && <button className="btn-danger ml-auto text-[0.7rem]" onClick={() => setServices(p => p.filter((_, i) => i !== idx))}>✕ Xóa</button>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <FL label="Loại Dịch Vụ">
                <select className="inp" value={svc.typeId} onChange={e => updateSvc(idx, "typeId", e.target.value)}>
                  <option value="">— Chọn loại —</option>
                  {serviceTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                </select>
              </FL>
              <div className="sm:col-span-2">
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
                <input type="number" className="inp text-center" min={1} value={svc.sessions} onChange={e => updateSvc(idx, "sessions", e.target.value)} />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <FL label="Tổng tiền hàng">
            <div className="text-lg font-extrabold text-[var(--text-1)] py-2">{fmt(totalAmount)}</div>
          </FL>
          <div>
            <FL label="Giảm giá đơn">
              <div className="flex gap-1.5">
                <input type="number" className="inp flex-1" value={discount || ""} placeholder="0" onChange={e => setDiscount(Number(e.target.value))} />
                <select className="inp w-20 sm:w-16" value={discountType} onChange={e => setDiscountType(e.target.value as "VND" | "%")}>
                  <option value="VND">VND</option><option value="%">%</option>
                </select>
              </div>
            </FL>
          </div>
          <FL label="Cần thu">
            <div className="text-lg font-extrabold text-[var(--rose)] py-2">{fmt(mustPay)}</div>
          </FL>
          <FL label="Thực thu">
            <input className="inp border-[1.5px] border-[var(--teal)] bg-[var(--teal-light)]" placeholder="Nhập số tiền" value={actualPaid} onChange={e => handlePaidChange(e.target.value)} />
          </FL>
          <FL label="Còn nợ">
            <div className="text-lg font-extrabold py-2" style={{ color: debt > 0 ? "var(--red)" : "var(--teal)" }}>{fmt(debt)}</div>
          </FL>
        </div>
      </div>

      {/* Note */}
      <div className="section-block p-4 sm:p-5 mb-5">
        <textarea className="inp min-h-[60px] text-sm" placeholder="📝  Ghi chú đơn hàng..." value={note} onChange={e => setNote(e.target.value)} />
      </div>

      <button className="btn-primary w-full py-3 text-sm rounded-[11px] justify-center" onClick={submit} disabled={loading}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8 2l6 6-6 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {loading ? "Đang xử lý..." : "Tạo Đơn Hàng"}
      </button>
    </div>
  );
}
