"use client";

import { useState } from "react";
import type { User } from "@/lib/types";
import DatePicker from "@/components/ui/DatePicker";
import TimePicker from "@/components/ui/TimePicker";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import { useT, formatDateLocalized } from "@/lib/i18n";

interface BirthDataFormProps {
  user: User;
}

export default function BirthDataForm({ user }: BirthDataFormProps) {
  const { t, lang } = useT();
  const [editing, setEditing] = useState(false);
  const [birthDate, setBirthDate] = useState(user.birthDate);
  const [birthTime, setBirthTime] = useState(user.birthTime || "");
  const [birthCity, setBirthCity] = useState(user.birthCity || "");
  const [cityLat, setCityLat] = useState<number | null>(null);
  const [cityLng, setCityLng] = useState<number | null>(null);

  function formatDate(iso: string) {
    const [y] = iso.split("-");
    return `${formatDateLocalized(iso, lang)} ${y}`;
  }

  function handleEdit() {
    if (confirm(t("profile.changeBirthConfirm"))) {
      setEditing(true);
    }
  }

  function handleSave() {
    try {
      const stored = localStorage.getItem("divina_user");
      const data = stored ? JSON.parse(stored) : {};
      data.birthDate = birthDate;
      data.birthTime = birthTime;
      data.birthCity = birthCity;
      if (cityLat != null) data.lat = cityLat;
      if (cityLng != null) data.lng = cityLng;
      if (cityLng != null) data.tzOffset = Math.round(cityLng / 15);
      localStorage.setItem("divina_user", JSON.stringify(data));
      sessionStorage.clear();
    } catch {}
    setEditing(false);
  }

  function handleCityChange(city: string, lat?: number, lng?: number) {
    setBirthCity(city);
    if (lat != null && lng != null) {
      setCityLat(lat);
      setCityLng(lng);
    }
  }

  if (!editing) {
    return (
      <div className="glass mx-5">
        <div className="relative z-10 p-4">
          <h3 className="font-medium tracking-wide text-white mb-3">{t("profile.birthData")}</h3>
          <div className="space-y-2.5 mb-4">
            <div>
              <span className="text-xs text-white/40">{t("profile.birthDate")}</span>
              <p className="text-sm text-white/80">{formatDate(birthDate)}</p>
            </div>
            {birthTime && (
              <div>
                <span className="text-xs text-white/40">{t("profile.birthTime")}</span>
                <p className="text-sm text-white/80">{birthTime}</p>
              </div>
            )}
            {birthCity && (
              <div>
                <span className="text-xs text-white/40">{t("profile.birthCity")}</span>
                <p className="text-sm text-white/80">{birthCity}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleEdit}
            className="w-full rounded-xl bg-white/10 border border-white/15 py-2.5 text-sm font-medium text-white/70 hover:bg-white/15 transition-colors"
          >
            {t("profile.changeBirthData")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass mx-5">
      <div className="relative z-10 p-4">
        <h3 className="font-medium tracking-wide text-white mb-3">{t("profile.birthData")}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-white/40 mb-1">{t("profile.birthDate")}</label>
            <DatePicker value={birthDate} onChange={setBirthDate} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{t("profile.birthTime")}</label>
            <TimePicker value={birthTime} onChange={setBirthTime} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">{t("profile.birthCity")}</label>
            <CityAutocomplete
              value={birthCity}
              onChange={handleCityChange}
              placeholder=""
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-white/30"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 py-2.5 text-sm font-medium text-white/50 hover:bg-white/10 transition-colors"
            >
              {t("profile.cancel")}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-white/15 border border-white/20 py-2.5 text-sm font-medium text-white/80 hover:bg-white/20 transition-colors"
            >
              {t("profile.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
