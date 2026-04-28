"use client";
import { useEffect } from "react";
interface ToastProps { message: string; type?: "success" | "error" | "info"; onClose: () => void; duration?: number; }
export default function Toast({ message, type = "info", onClose, duration = 3200 }: ToastProps) {
  useEffect(() => { const t = setTimeout(onClose, duration); return () => clearTimeout(t); }, [onClose, duration]);
  const icons = { success: "✓", error: "✕", info: "·" };
  return (
    <div className={`toast ${type}`} onClick={onClose}>
      <span style={{ fontWeight: 800, fontSize: "0.9rem", flexShrink: 0 }}>{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}
