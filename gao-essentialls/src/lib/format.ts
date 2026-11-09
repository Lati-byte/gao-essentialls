/** Shared formatting + parsing helpers (safe for both server and client). */

export function formatPrice(amount: number, symbol = "R"): string {
  const fixed = (Math.round(amount * 100) / 100).toFixed(2);
  const [whole, cents] = fixed.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${symbol}${withCommas}.${cents}`;
}

export function parseList(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function effectivePrice(p: { price: number; salePrice: number | null }): number {
  return p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price;
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export const PAYMENT_STATUSES = ["UNPAID", "PAID", "REFUNDED"] as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "Cash on Delivery",
  EFT: "EFT / Bank Transfer",
  PAY_ON_COLLECTION: "Pay on Collection",
};

export const DELIVERY_METHOD_LABELS: Record<string, string> = {
  DELIVERY: "Home Delivery",
  COLLECTION: "Store Collection",
};

export function statusLabel(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export const LOW_STOCK_THRESHOLD = 5;
