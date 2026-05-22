"use client";

import { useRouter } from "next/navigation";
import PaywallSheet from "./PaywallSheet";
import { formatPrice } from "@/lib/pricing";
import { useT } from "@/lib/i18n";
import { useOneTimePurchase } from "@/lib/use-one-time-purchase";

const PRODUCT_ID = "divina_interpretation";

interface InterpretationPaywallProps {
  open: boolean;
  onClose: () => void;
  onPurchased?: () => void;
}

export default function InterpretationPaywall({ open, onClose, onPurchased }: InterpretationPaywallProps) {
  const { t } = useT();
  const router = useRouter();
  const { purchasing, error, purchase } = useOneTimePurchase(PRODUCT_ID, "interpretation");

  const perks = [
    t("paywall.interp.perk1"),
    t("paywall.interp.perk2"),
    t("paywall.interp.perk3"),
    t("paywall.interp.perk4"),
    t("paywall.interp.perk5"),
  ];

  function handleSuccess() {
    onClose();
    if (onPurchased) onPurchased();
    else router.push("/interpretation");
  }

  return (
    <PaywallSheet
      open={open}
      onClose={onClose}
      videoSrc="/cosmos-7.mp4"
      cta={
        <div className="space-y-1.5">
          {error ? <p className="text-center text-xs text-red-400">{error}</p> : null}
          <button
            onClick={() => purchase(handleSuccess)}
            disabled={purchasing}
            className="w-full rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm py-4 text-base font-semibold text-white active:bg-white/20 transition-colors disabled:opacity-50"
          >
            {purchasing ? t("paywall.processing") : `${t("paywall.unlock")} — ${formatPrice(5)}`}
          </button>
        </div>
      }
    >
      <div className="text-center mb-8 pt-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/10 mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="5" opacity="0.5" />
            <line x1="12" y1="19" x2="12" y2="22" opacity="0.5" />
            <line x1="2" y1="12" x2="5" y2="12" opacity="0.5" />
            <line x1="19" y1="12" x2="22" y2="12" opacity="0.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{t("paywall.interp.title")}</h2>
        <p className="text-sm text-white/40">{t("paywall.interp.subtitle")}</p>
      </div>

      <div className="space-y-3 mb-4">
        {perks.map((text, i) => (
          <div key={i} className="flex items-start gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-white/50">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm text-white/70">{text}</span>
          </div>
        ))}
      </div>
    </PaywallSheet>
  );
}
