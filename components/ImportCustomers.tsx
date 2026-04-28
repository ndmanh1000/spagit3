"use client";
import { useState, useRef } from "react";
import Toast from "./Toast";

export default function ImportCustomers({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/customers/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        setToast({ msg: data.error, type: "error" });
      } else {
        setToast({
          msg: `Import thành công ${data.imported} khách hàng, bỏ qua ${data.skipped}`,
          type: "success",
        });
        onSuccess?.();
      }
    } catch (err) {
      setToast({ msg: String(err), type: "error" });
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleImport}
        style={{ display: "none" }}
      />
      <button
        className="btn-teal"
        onClick={() => fileRef.current?.click()}
        disabled={loading}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 2v10M4 8l4-4 4 4M2 14h12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {loading ? "Đang import..." : "Import Excel"}
      </button>
    </>
  );
}
