"use client";
import { useState, useEffect } from "react";
import POSPage from "./POS";
import DebtCollectionPage from "./DebtCollection";
import RevenuePage from "./Revenue";
import TransactionLogPage from "./TransactionLog";
import DebtManagementPage from "./DebtManagement";
import HistoryPage from "./History";
import CatalogPage from "./Catalog";

type PageId = "pos" | "debt-collect" | "revenue" | "txlog" | "debt-mgmt" | "history" | "catalog";

const MENU: { id: PageId; label: string; icon: React.ReactNode; badge?: string }[] = [
  {
    id: "pos", label: "Bán Hàng (POS)", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="3" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 3V2a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M6 8h4M8 6v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "debt-collect", label: "Thu Tiền Nợ", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 5v3.2L10.2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M5.5 12.5L3 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "revenue", label: "Doanh Thu & KH", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1.5 12L5 8l3 3 6.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 5h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    id: "txlog", label: "Nhật Ký Giao Dịch", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "debt-mgmt", label: "Quản Lý Công Nợ", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5l5.5 3v5L8 13l-5.5-3.5v-5L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M8 5.5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "history", label: "Tra Cứu Lịch Sử", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "catalog", label: "Quản Lý Danh Mục", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 1v2.5M8 12.5V15M1 8h2.5M12.5 8H15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M3.2 3.2l1.8 1.8M11 11l1.8 1.8M12.8 3.2L11 5M5 11l-1.8 1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    )
  },
];

const PAGE_TITLES: Record<PageId, string> = {
  "pos": "Bán Hàng (POS)",
  "debt-collect": "Thu Tiền Nợ",
  "revenue": "Doanh Thu & Khách Hàng",
  "txlog": "Nhật Ký Giao Dịch",
  "debt-mgmt": "Quản Lý Công Nợ",
  "history": "Tra Cứu Lịch Sử",
  "catalog": "Quản Lý Danh Mục",
};

export default function App() {
  const [active, setActive] = useState<PageId>("pos");
  const [syncing, setSyncing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });

  const handleSync = () => { setSyncing(true); setTimeout(() => setSyncing(false), 1000); };

  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const navigate = (id: PageId) => { setActive(id); setSidebarOpen(false); };

  const renderPage = () => {
    switch (active) {
      case "pos": return <POSPage />;
      case "debt-collect": return <DebtCollectionPage />;
      case "revenue": return <RevenuePage />;
      case "txlog": return <TransactionLogPage />;
      case "debt-mgmt": return <DebtManagementPage />;
      case "history": return <HistoryPage />;
      case "catalog": return <CatalogPage />;
    }
  };

  return (
    <div className="app-shell">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-name">
            <span style={{ fontSize: "1.4rem" }}>🌸</span>
            <span style={{ background: "linear-gradient(135deg,#d4547a,#c43d67)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pyna Spa</span>
          </div>
          <div className="sidebar-logo-sub">Chuẩn hoá vận hành spa</div>
        </div>

        {/* Sync */}
        <button className={`sync-btn${syncing ? " syncing" : ""}`} onClick={handleSync} style={{ margin: "0 0 14px", width: "100%" }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M12.5 7A5.5 5.5 0 112.1 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2.5 1.5v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {syncing ? "Đang đồng bộ..." : "Đã đồng bộ · Làm mới"}
        </button>

        <div className="sidebar-section-label">Quản lý</div>

        <nav>
          {MENU.map((item) => (
            <div key={item.id} className={`nav-item${active === item.id ? " active" : ""}`} onClick={() => navigate(item.id)}>
              <span className="nav-icon-wrap">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: "0.65rem", color: "var(--text-4)", lineHeight: 1.7, padding: "0 4px" }}>
            <div style={{ fontWeight: 700, color: "var(--text-3)", fontSize: "0.68rem" }}>PYNA SPA</div>
            <div>{dateStr}</div>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="main-area">
        {/* Top bar */}
        <header className="topbar">
          <button className="topbar-hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <span className="topbar-title">{PAGE_TITLES[active]}</span>
          <span className="topbar-date">{dateStr}</span>
          <button className={`sync-btn${syncing ? " syncing" : ""}`} onClick={handleSync} style={{ padding: "5px 12px" }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M12.5 7A5.5 5.5 0 112.1 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2.5 1.5v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {syncing ? "Đang đồng bộ..." : "Làm mới"}
          </button>
        </header>

        {/* Page content */}
        <div className="page-content anim-fadeup" key={active}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
