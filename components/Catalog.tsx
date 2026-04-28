"use client";
import { useState, useEffect } from "react";
import { fmt, api } from "@/lib/utils";
import Toast from "./Toast";
interface ServiceDetail { id: string; name: string; price: number; }
interface ServiceType { id: string; name: string; details: ServiceDetail[]; }
export default function CatalogPage() {
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [addDetailFor, setAddDetailFor] = useState<string | null>(null);
  const [newDetailName, setNewDetailName] = useState("");
  const [newDetailPrice, setNewDetailPrice] = useState("");
  const load = () => { setLoading(true); api("/api/services").then(d => { setTypes(d.serviceTypes); setLoading(false); }); };
  useEffect(() => { load(); }, []);
  const addType = async () => { if (!newTypeName.trim()) { setToast({ msg: "Nhập tên loại DV", type: "error" }); return; } try { await api("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "addType", name: newTypeName }) }); setToast({ msg: "Thêm thành công!", type: "success" }); setNewTypeName(""); setShowAddType(false); load(); } catch (e) { setToast({ msg: String(e), type: "error" }); } };
  const addDetail = async () => { if (!newDetailName.trim() || !newDetailPrice) { setToast({ msg: "Điền đủ thông tin", type: "error" }); return; } try { await api("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "addDetail", typeId: addDetailFor, name: newDetailName, price: Number(newDetailPrice) }) }); setToast({ msg: "Thêm thành công!", type: "success" }); setNewDetailName(""); setNewDetailPrice(""); setAddDetailFor(null); load(); } catch (e) { setToast({ msg: String(e), type: "error" }); } };
  const deleteType = async (id: string) => { if (!confirm("Xóa loại dịch vụ này?")) return; await api("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "deleteType", typeId: id }) }); setToast({ msg: "Đã xóa", type: "success" }); load(); };
  const deleteDetail = async (tid: string, did: string) => { if (!confirm("Xóa dịch vụ này?")) return; await api("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "deleteDetail", typeId: tid, detailId: did }) }); setToast({ msg: "Đã xóa", type: "success" }); load(); };
  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn-primary" onClick={() => setShowAddType(true)}>+ Thêm Loại Dịch Vụ</button>
      </div>
      {loading ? <div style={{ textAlign: "center", padding: 60, color: "var(--text-4)" }}>Đang tải...</div> : (
        <div className="flex flex-col gap-2.5">
          {types.map(st => (
            <div key={st.id} className="card" style={{ overflow: "hidden" }}>
              <div onClick={() => setExpanded(expanded === st.id ? null : st.id)} className="p-3 flex items-center gap-2 cursor-pointer transition-colors hover:bg-[var(--rose-light)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--rose-light)] flex items-center justify-center text-base flex-shrink-0">💆</div>
                <span className="flex-1 font-bold text-sm min-w-0 truncate" style={{ color: "var(--text-1)" }}>{st.name}</span>
                <span className="badge badge-rose text-[0.65rem] hidden sm:inline-block">{st.details.length} dịch vụ</span>
                <button className="btn-ghost text-[0.7rem] px-2 py-1 hidden md:inline-flex" onClick={e => { e.stopPropagation(); setAddDetailFor(st.id); setNewDetailName(""); setNewDetailPrice(""); }}>+ DV</button>
                <button className="btn-danger text-[0.7rem] px-2 py-1" onClick={e => { e.stopPropagation(); deleteType(st.id); }}>Xóa</button>
                <span className="text-[var(--text-4)] transition-transform text-xs" style={{ transform: expanded === st.id ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </div>
              {expanded === st.id && (
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="p-3 md:hidden">
                    <button className="btn-ghost text-xs w-full justify-center" onClick={() => { setAddDetailFor(st.id); setNewDetailName(""); setNewDetailPrice(""); }}>+ Thêm Dịch Vụ</button>
                  </div>
                  {st.details.length === 0 ? <div style={{ padding: "18px", color: "var(--text-4)", fontSize: "0.82rem", textAlign: "center" }}>Chưa có dịch vụ nào. Bấm "+ Thêm DV".</div> : (
                    <div className="overflow-x-auto">
                    <table className="tbl">
                      <thead><tr><th>Tên Dịch Vụ</th><th>Giá</th><th></th></tr></thead>
                      <tbody>{st.details.map(d => (
                        <tr key={d.id}>
                          <td style={{ color: "var(--text-1)" }}>{d.name}</td>
                          <td style={{ fontWeight: 700, color: "var(--rose)" }}>{fmt(d.price)}</td>
                          <td><button className="btn-danger text-[0.7rem] px-2 py-1" onClick={() => deleteDetail(st.id, d.id)}>Xóa</button></td>
                        </tr>
                      ))}</tbody>
                    </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {types.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-4)" }}>Chưa có loại dịch vụ nào.</div>}
        </div>
      )}
      {showAddType && (
        <div className="modal-overlay" onClick={() => setShowAddType(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Thêm Loại Dịch Vụ</div>
            <label className="field-label">Tên Loại Dịch Vụ *</label>
            <input className="inp" placeholder="VD: Chăm Sóc Da Mặt" value={newTypeName} onChange={e => setNewTypeName(e.target.value)} onKeyDown={e => e.key === "Enter" && addType()} autoFocus style={{ marginBottom: 20 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={addType} style={{ flex: 1, justifyContent: "center" }}>Thêm</button>
              <button className="btn-ghost" onClick={() => setShowAddType(false)} style={{ flex: 1 }}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      {addDetailFor && (
        <div className="modal-overlay" onClick={() => setAddDetailFor(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Thêm Dịch Vụ</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-3)", marginBottom: 18 }}>Loại: <span style={{ color: "var(--rose)", fontWeight: 600 }}>{types.find(t => t.id === addDetailFor)?.name}</span></div>
            <div style={{ marginBottom: 14 }}><label className="field-label">Tên Dịch Vụ *</label><input className="inp" placeholder="VD: Basic Facial 60 phút" value={newDetailName} onChange={e => setNewDetailName(e.target.value)} autoFocus /></div>
            <div style={{ marginBottom: 22 }}><label className="field-label">Giá (VND) *</label><input type="number" className="inp" placeholder="VD: 350000" value={newDetailPrice} onChange={e => setNewDetailPrice(e.target.value)} onKeyDown={e => e.key === "Enter" && addDetail()} /></div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={addDetail} style={{ flex: 1, justifyContent: "center" }}>Thêm</button>
              <button className="btn-ghost" onClick={() => setAddDetailFor(null)} style={{ flex: 1 }}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
