"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "@/components/ui/DatePicker";
import TimePicker from "@/components/ui/TimePicker";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import { formatPrice } from "@/lib/pricing";
import { useT } from "@/lib/i18n";

export default function CompatibilityPage() {
  const router = useRouter();
  const { t } = useT();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [birthTime, setBirthTime] = useState("12:00");
  const [birthCity, setBirthCity] = useState("");
  const [cityLat, setCityLat] = useState<number | null>(null);
  const [cityLng, setCityLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim() !== "" && birthDate !== "" && birthTime !== "" && birthCity.trim() !== "" && cityLat != null;

  const handleCityChange = useCallback((city: string, lat?: number, lng?: number) => {
    setBirthCity(city);
    if (lat != null && lng != null) {
      setCityLat(lat);
      setCityLng(lng);
    }
  }, []);

  async function handleCheck() {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      const partnerData = {
        name,
        birthDate,
        birthTime,
        birthCity,
        lat: cityLat,
        lng: cityLng,
        tzOffset: cityLng != null ? Math.round(cityLng / 15) : 5,
      };
      sessionStorage.setItem("divina_compat_partner", JSON.stringify(partnerData));
      router.push("/compatibility/result");
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-dvh pb-28">
      <div className="px-5 pt-[env(safe-area-inset-top)] mt-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-white mb-1">{t("compat.title")}</h1>
        <p className="text-sm text-white/40 leading-relaxed">
          {t("compat.desc")}
        </p>
      </div>

      <div className="px-5 space-y-3 mb-6">
        <div>
          <label className="block text-sm text-white/50 mb-2 font-medium">{t("compat.partnerName")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("compat.namePlaceholder")}
            className="w-full rounded-2xl bg-white/[0.12] border border-white/15 px-5 py-4 text-base text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-2 font-medium">{t("profile.birthDate")}</label>
          <DatePicker value={birthDate} onChange={setBirthDate} />
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-2 font-medium">{t("profile.birthTime")}</label>
          <TimePicker value={birthTime} onChange={setBirthTime} />
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-2 font-medium">{t("profile.birthCity")}</label>
          <CityAutocomplete
            value={birthCity}
            onChange={handleCityChange}
            placeholder={t("onboarding.cityPlaceholder")}
            className="w-full rounded-2xl bg-white/[0.12] border border-white/15 px-5 py-4 text-base text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
          />
        </div>
      </div>

      <div className="px-5 mb-4">
        <p className="text-xs text-white/25 leading-relaxed" suppressHydrationWarning>
          {formatPrice(2)}
        </p>
      </div>

      <div className="px-5 mt-auto">
        <button
          onClick={handleCheck}
          disabled={!canSubmit || loading}
          className="w-full rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 py-4 text-base font-semibold text-black/90 active:bg-white/60 transition-colors shadow-[0_4px_24px_rgba(0,0,0,0.5)] disabled:opacity-40"
        >
          {loading ? t("compat.loading") : t("compat.check")}
        </button>
      </div>
    </div>
  );
}
