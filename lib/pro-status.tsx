"use client";

/**
 * pro-status.tsx
 * Global React context for Divina Pro subscription status.
 *
 * EN mode: uses RevenueCat / Apple IAP
 * RU mode: uses localStorage activation code (set via /api/ru/activate)
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
import { APP_LANG } from "@/lib/i18n";

// ─── RU localStorage helpers ─────────────────────────────────────────────────

const RU_PRO_KEY = "divina_ru_pro";

export interface RuProData {
  isPro: boolean;
  expiresAt: string; // ISO date string
  code: string;
}

export function getRuProFromStorage(): RuProData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RU_PRO_KEY);
    if (!raw) return null;
    const data: RuProData = JSON.parse(raw);
    if (new Date(data.expiresAt) < new Date()) {
      localStorage.removeItem(RU_PRO_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setRuProInStorage(data: RuProData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RU_PRO_KEY, JSON.stringify(data));
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ProStatusContextValue {
  isPro: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
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
      if (APP_LANG === "ru") {
        // RU: check localStorage activation
        const ruData = getRuProFromStorage();
        setIsPro(ruData?.isPro === true);
        setCustomerInfo(null);
      } else {
        // EN: check RevenueCat
        const info = await getCustomerInfo();
        setCustomerInfo(info);
        setIsPro(info.isPro);
      }
    } catch {
      setIsPro(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 5000);
    if (APP_LANG === "ru") {
      // RU: no RevenueCat init needed
      refresh().finally(() => clearTimeout(timeout));
    } else {
      initPurchases().then(refresh).finally(() => clearTimeout(timeout));
    }
  }, [refresh]);

  return (
    <ProStatusContext.Provider value={{ isPro, isLoading, customerInfo, refresh }}>
      {children}
    </ProStatusContext.Provider>
  );
}

export function useProStatus() {
  return useContext(ProStatusContext);
}
