/**
 * purchases-native.ts
 * RevenueCat wrapper for Divina Pro subscriptions.
 * Works only on native (iOS / Android) — returns safe stubs on web.
 *
 * Product IDs (create these in App Store Connect + Google Play Console):
 *   divina_pro_monthly  — monthly subscription
 *   divina_pro_yearly   — yearly subscription
 *
 * RevenueCat setup:
 *   Entitlement ID : "pro"
 *   Offering ID    : "default"
 */

import { Capacitor } from "@capacitor/core";

// RevenueCat API keys (set in Vercel env vars per platform)
const RC_IOS_KEY = process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY ?? "";
const RC_ANDROID_KEY = process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY ?? "";

// RevenueCat entitlement that unlocks Pro features
export const PRO_ENTITLEMENT = "pro";

// ─── Types (subset of RevenueCat types we actually use) ───────────────────────

export interface RCPackage {
  identifier: string;               // "$rc_monthly" | "$rc_annual" | …
  packageType: string;
  product: {
    identifier: string;             // "divina_pro_monthly" / "divina_pro_yearly"
    priceString: string;            // "₽499" / "$4.99" — localized by Apple/Google
    title: string;
    description: string;
    price: number;
    currencyCode: string;
  };
}

export interface RCOffering {
  identifier: string;
  monthly: RCPackage | null;
  annual: RCPackage | null;
  availablePackages: RCPackage[];
}

export interface CustomerInfo {
  isPro: boolean;
  /** ISO date string, or null if not subscribed */
  expirationDate: string | null;
  /** ISO date string of original purchase, or null */
  originalPurchaseDate: string | null;
  /** "monthly" | "yearly" | null */
  activePlanType: "monthly" | "yearly" | null;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

async function getPurchases() {
  // Dynamic import so the module doesn't crash on web (Capacitor bridge absent)
  const { Purchases } = await import("@revenuecat/purchases-capacitor");
  return Purchases;
}

function parseCustomerInfo(raw: Record<string, unknown>): CustomerInfo {
  const entitlements = (raw.entitlements as Record<string, unknown>) ?? {};
  const active = (entitlements.active as Record<string, unknown>) ?? {};
  const proEntitlement = active[PRO_ENTITLEMENT] as Record<string, unknown> | undefined;

  const isPro = proEntitlement !== undefined;
  const expirationDate = (proEntitlement?.expirationDate as string) ?? null;
  const originalPurchaseDate = (proEntitlement?.latestPurchaseDate as string) ?? null;

  // Determine plan type from product identifier
  let activePlanType: "monthly" | "yearly" | null = null;
  const productId = (proEntitlement?.productIdentifier as string) ?? "";
  if (productId.includes("monthly")) activePlanType = "monthly";
  else if (productId.includes("yearly") || productId.includes("annual")) activePlanType = "yearly";

  return { isPro, expirationDate, originalPurchaseDate, activePlanType };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Call once at app startup (e.g. in layout or root component).
 * Safe to call on web — does nothing.
 */
export async function initPurchases(): Promise<void> {
  if (!isNative()) return;
  try {
    const Purchases = await getPurchases();
    const platform = Capacitor.getPlatform();
    const apiKey = platform === "ios" ? RC_IOS_KEY : RC_ANDROID_KEY;
    if (!apiKey) {
      console.warn("[Purchases] RevenueCat API key not set for platform:", platform);
      return;
    }
    await Purchases.configure({ apiKey });
    console.log("[Purchases] RevenueCat configured for", platform);
  } catch (err) {
    console.error("[Purchases] init failed:", err);
  }
}

/**
 * Get current customer Pro status.
 * Returns { isPro: false } on web or on error.
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  if (!isNative()) return { isPro: false, expirationDate: null, originalPurchaseDate: null, activePlanType: null };
  try {
    const Purchases = await getPurchases();
    const { customerInfo } = await Purchases.getCustomerInfo();
    return parseCustomerInfo(customerInfo as unknown as Record<string, unknown>);
  } catch (err) {
    console.error("[Purchases] getCustomerInfo failed:", err);
    return { isPro: false, expirationDate: null, originalPurchaseDate: null, activePlanType: null };
  }
}

/**
 * Get current offerings (packages with localized prices from Apple/Google).
 * Returns null on web or on error.
 */
export async function getOfferings(): Promise<RCOffering | null> {
  if (!isNative()) return null;
  try {
    const Purchases = await getPurchases();
    const { current } = await Purchases.getOfferings();
    if (!current) return null;
    return current as unknown as RCOffering;
  } catch (err) {
    console.error("[Purchases] getOfferings failed:", err);
    return null;
  }
}

/**
 * Purchase a package. Returns updated CustomerInfo.
 * Throws on user cancellation or payment error.
 */
export async function purchasePackage(pkg: RCPackage): Promise<CustomerInfo> {
  if (!isNative()) throw new Error("Purchases not available on web");
  const Purchases = await getPurchases();
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg as never });
  return parseCustomerInfo(customerInfo as unknown as Record<string, unknown>);
}

/**
 * Restore previous purchases (required by App Store guidelines).
 * Returns updated CustomerInfo.
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  if (!isNative()) return { isPro: false, expirationDate: null, originalPurchaseDate: null, activePlanType: null };
  try {
    const Purchases = await getPurchases();
    const { customerInfo } = await Purchases.restorePurchases();
    return parseCustomerInfo(customerInfo as unknown as Record<string, unknown>);
  } catch (err) {
    console.error("[Purchases] restorePurchases failed:", err);
    return { isPro: false, expirationDate: null, originalPurchaseDate: null, activePlanType: null };
  }
}
