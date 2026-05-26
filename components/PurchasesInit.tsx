"use client";

import { useEffect } from "react";
import { initPurchases } from "@/lib/purchases-native";

export default function PurchasesInit() {
  useEffect(() => {
    initPurchases();
  }, []);
  return null;
}
