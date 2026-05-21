"use client";

/**
 * pro-status.tsx
 * Global React context for Divina Pro subscription status.
 *
 * Usage anywhere in the app:
 *   const { isPro, isLoading, customerInfo, refresh } = useProStatus();
 *
 * isPro === true  → user has active Pro subscription
 * isPro === false → free user (show paywall)
 * isLoading       → still checking (show nothing or skeleton)
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  getCustomerInfo,
  initPurchases,
  type CustomerInfo,
} from "@/lib/purchases-native";

interface ProStatusContextValue {
  /** True if user has an active Pro subscription */
  isPro: boolean;
  /** True while the initial status check is in progress */
  isLoading: boolean;
  /** Full customer info (plan type, expiration date, etc.) */
  customerInfo: CustomerInfo | null;
  /** Call this after a successful purchase or restore to refresh status */
  refresh: () => Promise<void>;
}

const ProStatusContext = createContext<ProStatusContextValue>({
  isPro: false,
  isLoading: true,
  customerInfo: null,
  refresh: async () => {},
});

export function ProStatusProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  const refresh = useCallback(async () => {
    try {
      const info = await getCustomerInfo();
      setCustomerInfo(info);
      setIsPro(info.isPro);
    } catch {
      setIsPro(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Init RevenueCat SDK, then check status
    initPurchases().then(refresh);
  }, [refresh]);

  return (
    <ProStatusContext.Provider value={{ isPro, isLoading, customerInfo, refresh }}>
      {children}
    </ProStatusContext.Provider>
  );
}

/** Hook to access Pro status anywhere in the app */
export function useProStatus() {
  return useContext(ProStatusContext);
}
