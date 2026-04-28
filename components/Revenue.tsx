"use client";
import { useState, useEffect, useRef } from "react";
import { fmt, fmtShort } from "@/lib/utils";
interface RevenueData { totalRevenue: number; totalDebt: number; totalOrders: number; totalCustomers: number; byDay: Record<string, number>; byService: Record<string, number>; byChannel: Record<string, number>; topCustomers: { name: string; phone: string; spent: number; orders: number }[]; debtCustomers: { id: string; name: string; phone: string; debt: number }[]; }
declare global { interface Window { Chart: any; } }
const COLORS = ["#d4547a", "#3b82f6", "#0ea882", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function RevenuePage() {
  const now = new Date();
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const todayStr = now.toISOString().split("T")[0];
  const [from, setFrom] = useState(firstDay);
  const [to, setTo] = useState(todayStr);
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "customers" | "debt">("overview");
  const lineRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);
  const lineChart = useRef<any>(null);
  const donutChart = useRef<any>(null);
  const scriptLoaded = useRef(false);

  const load = () => { setLoading(true); fetch(`/api/revenue?from=${from}&to=${to}`).then(r => r.json()).then(d => { setData(d); setLoading(false); }); };
  useEffect(() => { load(); }, []);// eslint-disable-line

  useEffect(() => {
    if (!data || tab !== "overview") return;
    const build = () => {
      const Ch = window.Chart;
      Ch.defaults.color = "#8b7fa0";
      Ch.defaults.borderColor = "#e8e3e8";
      Ch.defaults.font.family = "'Inter',-apple-system,sans-serif";
      Ch.defaults.font.size = 11;
      if (lineRef.current) {
        if (lineChart.current) lineChart.current.destroy();
        const dayEntries = Object.entries(data.byDay).sort((a, b) => a[0].localeCompare(b[0]));
        lineChart.current = new Ch(lineRef.current, {
          type: "line",
          data: {
            labels: dayEntries.map(([k]) => k.slice(5)), datasets: [
              { label: "Doanh thu", data: dayEntries.map(([, v]) => v), borderColor: "#d4547a", backgroundColor: "rgba(212,84,122,0.07)", borderWidth: 2.5, fill: true, tension: 0.42, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: "#d4547a", pointHoverBorderColor: "white", pointHoverBorderWidth: 2 },
              { label: "Thực thu", data: dayEntries.map(([, v]) => v * 0.85), borderColor: "#0ea882", backgroundColor: "rgba(14,168,130,0.04)", borderWidth: 1.8, borderDash: [5, 3], fill: false, tension: 0.42, pointRadius: 0, pointHoverRadius: 4, pointHoverBackgroundColor: "#0ea882", pointHoverBorderColor: "white", pointHoverBorderWidth: 2 },
            ]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: "white", borderColor: "#e8e3e8", borderWidth: 1, titleColor: "#1a1523", bodyColor: "#4b4558", padding: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString("vi-VN")}đ` } } }, scales: { x: { grid: { display: false }, ticks: { color: "#b8aec8", font: { size: 10 }, maxTicksLimit: 10 } }, y: { grid: { color: "#f5f4f6" }, ticks: { color: "#b8aec8", font: { size: 10 }, callback: (v: number) => fmtShort(v) } } } }
        });
      }
      if (donutRef.current) {
        if (donutChart.current) donutChart.current.destroy();
        const entries = Object.entries(data.byChannel).sort((a, b) => b[1] - a[1]);
        donutChart.current = new Ch(donutRef.current, {
          type: "doughnut",
          data: { labels: entries.map(([k]) => k), datasets: [{ data: entries.map(([, v]) => v), backgroundColor: COLORS, borderColor: "white", borderWidth: 3, hoverOffset: 6 }] },
          options: { responsive: true, maintainAspectRatio: false, cutout: "70%", plugins: { legend: { display: false }, tooltip: { backgroundColor: "white", borderColor: "#e8e3e8", borderWidth: 1, titleColor: "#1a1523", bodyColor: "#4b4558", padding: 10, callbacks: { label: (ctx: any) => ` ${ctx.label}: ${fmt(ctx.parsed)}` } } } }
        });
      }
    };
    if (window.Chart) { build(); return; }
    if (scriptLoaded.current) { const t = setInterval(() => { if (window.Chart) { clearInterval(t); build(); } }, 100); return () => clearInterval(t); }
    scriptLoaded.current = true;
    const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"; s.onload = build; document.head.appendChild(s);
  }, [data, tab]);// eslint-disable-line

  const maxSvc = data ? Math.max(...Object.values(data.byService), 1) : 1;
  const channelEntries = data ? Object.entries(data.byChannel).sort((a, b) => b[1] - a[1]) : [];
  const totalChannel = channelEntries.reduce((s, [, v]) => s + v, 0);

  const STATS = [
    { label: "Tổng Doanh Thu", value: data ? fmt(data.totalRevenue) : "—", color: "var(--rose)", bg: "var(--rose-light)", icon: "💎", cls: "" },
    { label: "Tổng Công Nợ", value: data ? fmt(data.totalDebt) : "—", color: "var(--red)", bg: "var(--red-light)", icon: "📌", cls: "" },
    { label: "Số Đơn Hàng", value: data ? `${data.totalOrders} đơn` : "—", color: "var(--blue)", bg: "var(--blue-light)", icon: "🛒", cls: "" },
    { label: "Khách Hàng", value: data ? `${data.totalCustomers} KH` : "—", color: "var(--teal)", bg: "var(--teal-light)", icon: "👥", cls: "" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border border-[var(--border)] mb-5">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--text-3)" }}><rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" /><path d="M1 5h12" stroke="currentColor" strokeWidth="1.3" /></svg>
        <input type="date" className="inp text-xs" value={from} onChange={e => setFrom(e.target.value)} style={{ width: 130 }} />
        <span className="text-[var(--text-4)] text-xs">→</span>
        <input type="date" className="inp text-xs" value={to} onChange={e => setTo(e.target.value)} style={{ width: 130 }} />
        <button className="btn-primary text-xs px-3 py-1.5" onClick={load}>Xem báo cáo</button>
        <button className="btn-ghost text-xs px-2 py-1" onClick={() => { setFrom(firstDay); setTo(todayStr); setTimeout(load, 80); }}>Tháng này</button>
        <button className="btn-ghost text-xs px-2 py-1" onClick={() => { const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1); const le = new Date(now.getFullYear(), now.getMonth(), 0); setFrom(lm.toISOString().split("T")[0]); setTo(le.toISOString().split("T")[0]); setTimeout(load, 80); }}>Tháng trước</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "var(--text-4)" }}>Đang tải dữ liệu...</div>
      ) : data && (<>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {STATS.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="tab-bar">
          {(["overview", "customers", "debt"] as const).map(t => (
            <button key={t} className={`tab-btn${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t === "overview" ? "📈 Tổng Quan" : t === "customers" ? "👑 Khách Hàng" : "📌 Công Nợ"}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="chart-card">
              <div className="chart-title">Doanh thu theo ngày</div>
              <div className="chart-subtitle">{from} → {to}</div>
              <div className="chart-legend">
                <div className="legend-item"><div className="legend-dot" style={{ background: "#d4547a" }}></div>Doanh thu</div>
                <div className="legend-item"><div className="legend-dot" style={{ background: "#0ea882", opacity: 0.7 }}></div>Thực thu (ước)</div>
              </div>
              <div style={{ position: "relative", height: 200 }}>
                <canvas ref={lineRef} role="img" aria-label="Biểu đồ doanh thu theo ngày">Dữ liệu doanh thu theo ngày.</canvas>
              </div>
              {Object.keys(data.byDay).length === 0 && <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-4)", fontSize: "0.82rem" }}>Chưa có dữ liệu trong khoảng thời gian này</div>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
              <div className="chart-card">
                <div className="chart-title">Theo loại dịch vụ</div>
                <div className="chart-subtitle">Doanh thu từng nhóm</div>
                {Object.entries(data.byService).sort((a, b) => b[1] - a[1]).map(([name, val], i) => (
                  <div key={name} className="hbar-row">
                    <div className="hbar-label">{name}</div>
                    <div className="hbar-track"><div className="hbar-fill" style={{ width: `${(val / maxSvc * 100).toFixed(1)}%`, background: `linear-gradient(90deg,${COLORS[i % COLORS.length]}88,${COLORS[i % COLORS.length]})` }} /></div>
                    <div className="hbar-val">{fmtShort(val)}</div>
                  </div>
                ))}
                {Object.keys(data.byService).length === 0 && <div style={{ color: "var(--text-4)", fontSize: "0.8rem", padding: "12px 0" }}>Chưa có dữ liệu</div>}
              </div>
              <div className="chart-card">
                <div className="chart-title">Theo kênh bán</div>
                <div className="chart-subtitle">Phân bổ doanh thu</div>
                <div className="chart-legend">
                  {channelEntries.slice(0, 6).map(([name, val], i) => (
                    <div key={name} className="legend-item">
                      <div className="legend-dot" style={{ background: COLORS[i % COLORS.length] }}></div>
                      {name}{totalChannel > 0 ? ` ${Math.round(val / totalChannel * 100)}%` : ""}
                    </div>
                  ))}
                </div>
                <div style={{ position: "relative", height: 160 }}>
                  <canvas ref={donutRef} role="img" aria-label="Biểu đồ doanh thu theo kênh">Phân bổ theo kênh bán.</canvas>
                </div>
                {channelEntries.length === 0 && <div style={{ color: "var(--text-4)", fontSize: "0.8rem", padding: "12px 0", textAlign: "center" }}>Chưa có dữ liệu</div>}
              </div>
            </div>
          </div>
        )}
        {tab === "customers" && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>#</th><th>Khách Hàng</th><th className="hidden sm:table-cell">SĐT</th><th className="hidden md:table-cell">Số Đơn</th><th>Tổng Chi</th></tr></thead>
              <tbody>
                {data.topCustomers.map((c, i) => (
                  <tr key={c.phone}>
                    <td style={{ fontWeight: 700, color: i < 3 ? "var(--rose)" : "var(--text-4)" }}>{i + 1}{i === 0 ? " 👑" : ""}</td>
                    <td style={{ fontWeight: 600, color: "var(--text-1)" }}>{c.name}</td>
                    <td className="hidden sm:table-cell" style={{ color: "var(--text-3)", fontFamily: "monospace", fontSize: "0.8rem" }}>{c.phone}</td>
                    <td className="hidden md:table-cell"><span className="badge badge-blue">{c.orders} đơn</span></td>
                    <td style={{ fontWeight: 800, color: "var(--rose)" }}>{fmt(c.spent)}</td>
                  </tr>
                ))}
                {data.topCustomers.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-4)" }}>Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
            </div>
          </div>
        )}
        {tab === "debt" && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Khách Hàng</th><th className="hidden sm:table-cell">SĐT</th><th>Số Tiền Nợ</th></tr></thead>
              <tbody>
                {data.debtCustomers.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: "var(--text-1)" }}>{c.name}</td>
                    <td className="hidden sm:table-cell" style={{ color: "var(--text-3)", fontFamily: "monospace", fontSize: "0.8rem" }}>{c.phone}</td>
                    <td style={{ fontWeight: 800, color: "var(--red)" }}>{fmt(c.debt)}</td>
                  </tr>
                ))}
                {data.debtCustomers.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", padding: 40, color: "var(--teal)" }}>🎉 Không có công nợ!</td></tr>}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </>)}
    </div>
  );
}
