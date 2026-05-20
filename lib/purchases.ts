export interface Purchase {
  type: string;
  date: string;
  meta?: Record<string, string>;
}

const STORAGE_KEY = "divina_purchases";

export function getPurchases(): Purchase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePurchase(type: string, meta?: Record<string, string>) {
  const purchases = getPurchases();
  purchases.unshift({ type, date: new Date().toISOString(), meta });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
}

export function hasPurchase(type: string): boolean {
  return getPurchases().some((p) => p.type === type);
}
