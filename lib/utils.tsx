export const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
export const fmtShort = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k";
  return n.toString();
};
export const today = () => new Date().toISOString().split("T")[0];
export async function api(path: string, opts?: RequestInit): Promise<any> {
  const res = await fetch(path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Lỗi" }));
    throw new Error(err.error || "Lỗi server");
  }
  return res.json();
}
