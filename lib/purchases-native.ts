/**
 * purchases-native.ts
 * RevenueCat wrapper for Divina subscriptions and one-time purchases.
 * Works only on native (iOS / Android) — returns safe stubs on web.
 *
 * Product IDs (create these in App Store Connect + Google Play Console):
 *   app_divina_pro_monthly    — monthly Pro subscription
 *   app_divina_pro_yearly     — yearly Pro subscription
 *   divina_compatibility      — one-time: compatibility report
 *   divina_interpretation     — one-time: natal chart interpretation
 *   divina_weekly             — one-time: weekly forecast
 *
 * RevenueCat setup:
 *   Entitlement ID : "pro"          (for subscription)
 *   Entitlement ID : "compatibility" (for one-time)
 *   Entitlement ID : "interpretation"
 *   Entitlement ID : "weekly"
 *   Offering ID    : "default"
 */

import { Capacitor } from "@capacitor/core";

// RevenueCat API keys — public keys, safe to have in client bundle.
// Set NEXT_PUBLIC_REVENUECAT_IOS_KEY in Vercel env vars to override.
const RC_IOS_KEY =
  process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY ||
  "appl_saWJTsYcSArqrIOXjESrPBdnJgx";
const RC_ANDROID_KEY =
  process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY || "";

// RevenueCat entitlement that unlocks Pro features
export const PRO_ENTITLEMENT = "pro";

// ─── Types (subset of RevenueCat types we actually use) ───────────────────────

export interface RCPackage {
  identifier: string;               // "$rc_monthly" | "$rc_annual" | …
  packageType: string;
  product: {
    identifier: string;             // "app_divina_pro_monthly" / "app_divina_pro_yearly"
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
  // Dynamic import with timeout — if the module hangs, don't block forever
  const result = await Promise.race([
    import("@revenuecat/purchases-capacitor"),
    new Promise<never>((_, r) => setTimeout(() => r(new Error("import timeout")), 5000)),
  ]);
  return result.Purchases;
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

// ─── Configure (singleton — called at most once, 5s timeout) ─────────────────

let _configPromise: Promise<boolean> | null = null;

/** Returns true if SDK was configured, false if timeout/error. */
async function ensureConfigured(): Promise<boolean> {
  if (!isNative()) return false;
  if (_configPromise) return _configPromise;

  _configPromise = (async () => {
    try {
      const Purchases = await getPurchases();
      const platform = Capacitor.getPlatform();
      const apiKey = platform === "ios" ? RC_IOS_KEY : RC_ANDROID_KEY;
      if (!apiKey) return false;
      await Promise.race([
        Purchases.configure({ apiKey }),
        new Promise<never>((_, r) => setTimeout(() => r(new Error("configure timeout 10s")), 10000)),
      ]);
      console.log("[Purchases] configured");
      return true;
    } catch (err) {
      console.error("[Purchases] configure failed:", err);
      _configPromise = null; // allow retry next time
      return false;
    }
  })();

  return _configPromise;
}

/** Call once at startup (ProStatusProvider). Kicks off configure early. */
export async function initPurchases(): Promise<void> {
  await ensureConfigured();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getCustomerInfo(): Promise<CustomerInfo> {
  const empty: CustomerInfo = { isPro: false, expirationDate: null, originalPurchaseDate: null, activePlanType: null };
  if (!isNative()) return empty;
  try {
    const ok = await ensureConfigured();
    if (!ok) return empty;
    const Purchases = await getPurchases();
    const { customerInfo } = await Purchases.getCustomerInfo();
    return parseCustomerInfo(customerInfo as unknown as Record<string, unknown>);
  } catch (err) {
    console.error("[Purchases] getCustomerInfo failed:", err);
    return empty;
  }
}

export async function getOfferings(): Promise<RCOffering | null> {
  if (!isNative()) return null;
  try {
    const ok = await ensureConfigured();
    if (!ok) return null;
    const Purchases = await getPurchases();
    const result = await Promise.race([
      Purchases.getOfferings(),
      new Promise<never>((_, r) => setTimeout(() => r(new Error("offerings timeout")), 8000)),
    ]);
    const current = result.current as unknown as RCOffering | null;
    if (!current) return null;
    const pkgs = (current.availablePackages ?? []) as RCPackage[];
    if (!current.monthly) current.monthly = pkgs.find(p => p.identifier === "$rc_monthly") ?? null;
    if (!current.annual)  current.annual  = pkgs.find(p => p.identifier === "$rc_annual")  ?? null;
    return current;
  } catch (err) {
    console.error("[Purchases] getOfferings failed:", err);
    return null;
  }
}

export async function purchasePackage(pkg: RCPackage): Promise<CustomerInfo> {
  if (!isNative()) throw new Error("Purchases not available on web");
  // Outer timeout starts immediately — catches hangs at ANY step
  return Promise.race([
    (async () => {
      const ok = await ensureConfigured();
      if (!ok) throw new Error("configure failed");
      const Purchases = await getPurchases();
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg as never });
      return parseCustomerInfo(customerInfo as unknown as Record<string, unknown>);
    })(),
    new Promise<never>((_, r) => setTimeout(() => r(new Error("purchase timeout 20s")), 20000)),
  ]);
}

/**
 * Purchase a one-time product by its App Store product identifier.
 */
export async function purchaseProduct(productId: string): Promise<CustomerInfo> {
  if (!isNative()) throw new Error("Purchases not available on web");
  const ok = await ensureConfigured();
  if (!ok) throw new Error("RevenueCat не настроен");
  const Purchases = await getPurchases();

  const { current } = await Promise.race([
    Purchases.getOfferings(),
    new Promise<never>((_, r) => setTimeout(() => r(new Error("offerings timeout")), 8000)),
  ]);
  if (!current) throw new Error("No offerings available");

  const allPkgs: RCPackage[] = (current as unknown as RCOffering).availablePackages ?? [];
  const pkg = allPkgs.find(p => p.product.identifier === productId);
  if (!pkg) throw new Error(`Product ${productId} not found in current offering`);

  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg as never });
  return parseCustomerInfo(customerInfo as unknown as Record<string, unknown>);
}

/**
 * Get the localized price string for a product from App Store.
 */
export async function getProductPrice(productId: string): Promise<string | null> {
  if (!isNative()) return null;
  try {
    const ok = await ensureConfigured();
    if (!ok) return null;
    const Purchases = await getPurchases();
    const { current } = await Purchases.getOfferings();
    if (!current) return null;
    const allPkgs: RCPackage[] = (current as unknown as RCOffering).availablePackages ?? [];
    const pkg = allPkgs.find(p => p.product.identifier === productId);
    return pkg?.product.priceString ?? null;
  } catch {
    return null;
  }
}

/**
 * Restore previous purchases (required by App Store guidelines).
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  if (!isNative()) return { isPro: false, expirationDate: null, originalPurchaseDate: null, activePlanType: null };
  try {
    const ok = await ensureConfigured();
    if (!ok) return { isPro: false, expirationDate: null, originalPurchaseDate: null, activePlanType: null };
    const Purchases = await getPurchases();
    const { customerInfo } = await Purchases.restorePurchases();
    return parseCustomerInfo(customerInfo as unknown as Record<string, unknown>);
  } catch (err) {
    console.error("[Purchases] restorePurchases failed:", err);
    return { isPro: false, expirationDate: null, originalPurchaseDate: null, activePlanType: null };
  }
}
