# Payment Flow — Debug Log

**App:** Divina | **Bundle ID:** `divina.company` | **Platform:** iOS (Capacitor + Next.js on Vercel)  
**RC iOS Key:** `appl_saWJTsYcSArqrIOXjESrPBdnJgx`  
**Product IDs:** `app_divina_pro_monthly` ($4.99/mo), `app_divina_pro_yearly` ($24.99/yr)  
**RC Offering:** default | Packages: `$rc_monthly`, `$rc_annual`  
**App loads JS from:** `https://divina-app.vercel.app` (remote Vercel URL via Capacitor server.url)

---

## Infrastructure Status

| Item | Status |
|------|--------|
| App Store Connect app `divina.company` | ✅ Exists |
| Products in ASC | ✅ `app_divina_pro_monthly` + `app_divina_pro_yearly` — "Ready to Submit" |
| RC project configured | ✅ Entitlements: `pro`, Offering: default with both packages |
| Agreements & Banking in ASC | ✅ Active (Каспи карта, W-8BEN) |
| `NEXT_PUBLIC_REVENUECAT_IOS_KEY` in Vercel env | ❌ NOT set — only in .env.local |

---

## Attempt Log

### Attempt 1 — Double init race condition
**What:** `PurchasesInit` component in layout.tsx AND `ProStatusProvider` both called `initPurchases()` on mount → two concurrent `configure()` calls to native RC SDK  
**Symptom:** UI showed "loading..." indefinitely  
**Fix:** Removed `PurchasesInit` from layout.tsx  
**Result:** Still "loading..."

---

### Attempt 2 — Empty RC key on Vercel
**What:** `NEXT_PUBLIC_REVENUECAT_IOS_KEY` only existed in `.env.local` (local dev only). Vercel build had empty string → `if (!apiKey) return null` → RC never configured  
**Symptom:** "loading..." or "offering=null" depending on code path  
**Fix:** Hardcoded fallback key in `purchases-native.ts`:  
```ts
const RC_IOS_KEY = process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY || "appl_saWJTsYcSArqrIOXjESrPBdnJgx";
```
**Result:** Still "loading..." (key wasn't the only issue)

---

### Attempt 3 — Singleton _initPromise
**What:** Used singleton promise so configure() only runs once  
**Symptom:** Still hanging  
**Fix attempt:** Reverted — singleton was also hanging  
**Result:** Reverted to "direct configure() per call" approach

---

### Attempt 4 — Timeout on getOfferings()
**What:** Added `Promise.race([Purchases.getOfferings(), timeout(8s)])` to prevent infinite hang  
**Symptom:** UI was stuck on "loading..." forever  
**Fix:** Timeout returns null → UI shows fallback hardcoded prices  
**Result:** UI no longer hangs. But "processing" appeared on purchase attempt

---

### Attempt 5 — Fallback purchaseProduct when offering=null
**What:** If getOfferings() returned null (timed out), purchase was blocked. Added fallback: call `purchaseProduct("app_divina_pro_yearly")` directly  
**Result:** Button now shows "processing" when tapped — purchase attempt starts! But hangs on "processing" (Apple payment sheet doesn't appear)

---

### Attempt 6 — ensureConfigured() singleton with timeout (CURRENT)
**What:** All RC functions called `configure()` independently and concurrently (ProStatusProvider + getOfferings + purchasePackage). Theory: concurrent configure() calls deadlock native RC SDK.  
**Fix:** Single `ensureConfigured()` function with `_configPromise` singleton + 5s timeout. All public functions call `ensureConfigured()` instead of `configure()` directly.  
**Commit:** `2a9477a`  
**Result:** ⏳ TESTING IN PROGRESS

---

## Current Code Architecture (as of commit 2a9477a)

```
lib/purchases-native.ts:
  _configPromise: Promise<boolean> | null   ← singleton, set on first call
  ensureConfigured()                        ← 5s timeout on configure()
  initPurchases()        → ensureConfigured()
  getCustomerInfo()      → ensureConfigured() → getCustomerInfo
  getOfferings()         → ensureConfigured() → getOfferings [8s timeout]
  purchasePackage(pkg)   → ensureConfigured() → purchasePackage
  purchaseProduct(id)    → ensureConfigured() → getOfferings [8s] → purchasePackage
  restorePurchases()     → ensureConfigured() → restorePurchases

app/pro/page.tsx:
  - getOfferings() on mount → sets monthlyPkg / yearlyPkg (or null on timeout)
  - handlePurchase():
      if (pkg from RC) → purchasePackage(pkg)
      else             → purchaseProduct("app_divina_pro_yearly" or "monthly")
```

---

## Key Facts for Next Session

1. **Web browser always shows `offering=null`** — correct, `isNative()` = false on web
2. **iPhone showed `loading...`** — getOfferings() was hanging before timeouts were added
3. **`pkgs=2` was seen once** — RC offerings DO load sometimes; issue is intermittent or timing-related
4. **"processing" now shows** — purchase attempt starts but Apple payment sheet doesn't appear
5. **configure() is the suspected bottleneck** — adding singleton to prevent concurrent calls
6. **StoreKit products "Ready to Submit"** — should work for sandbox testing
7. **No sandbox test account setup confirmed** — user hasn't confirmed Settings → App Store → Sandbox Account exists
8. **Bundle ID in Xcode:** `divina.company` ✅ (user confirmed, do not change)
