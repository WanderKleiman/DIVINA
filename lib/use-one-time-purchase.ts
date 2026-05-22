"use client";

import { useState } from "react";
import { purchaseProduct } from "@/lib/purchases-native";
import { savePurchase } from "@/lib/purchases";

/**
 * Shared hook for one-time in-app purchases via RevenueCat.
 * Falls back gracefully on web (dev mode) so the UI still works.
 */
export function useOneTimePurchase(productId: string, purchaseType: string) {
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState("");

  async function purchase(onSuccess: () => void) {
    setPurchasing(true);
    setError("");
    try {
      await purchaseProduct(productId);
      savePurchase(purchaseType);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      // On web / dev: SDK not available — simulate the purchase so UI works
      if (msg.includes("not available on web") || msg.includes("No offerings")) {
        savePurchase(purchaseType);
        onSuccess();
        return;
      }
      // User tapped Cancel — not an error
      if (msg.toLowerCase().includes("cancel")) return;
      setError("Purchase failed. Please try again.");
    } finally {
      setPurchasing(false);
    }
  }

  return { purchasing, error, purchase };
}
