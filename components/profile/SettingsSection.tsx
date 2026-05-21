"use client";

import { useState, useEffect } from "react";
import { getUserData } from "@/lib/user-data";
import { useT } from "@/lib/i18n";
import type { ToneOfVoice } from "@/lib/ai-interpret";

export default function SettingsSection() {
  const { t } = useT();
  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [tone, setTone] = useState<ToneOfVoice>("deep");

  useEffect(() => {
    const user = getUserData();
    setTone(user.tone || "deep");
  }, []);

  const TONES: { value: ToneOfVoice; labelKey: string; descKey: string }[] = [
    { value: "direct", labelKey: "tone.direct", descKey: "tone.direct.desc" },
    { value: "deep", labelKey: "tone.deep", descKey: "tone.deep.desc" },
    { value: "friendly", labelKey: "tone.friendly", descKey: "tone.friendly.desc" },
  ];

  function handleToneChange(newTone: ToneOfVoice) {
    setTone(newTone);
    try {
      const stored = localStorage.getItem("divina_user");
      const data = stored ? JSON.parse(stored) : {};
      data.tone = newTone;
      localStorage.setItem("divina_user", JSON.stringify(data));
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith("divina")) sessionStorage.removeItem(key);
      }
    } catch {}
  }

  return (
    <div className="glass mx-5">
      <div className="relative z-10 p-4">
        <h3 className="font-medium tracking-wide text-white mb-3">{t("profile.settings")}</h3>
        <div className="space-y-3">
          {/* Tone of Voice */}
          <div>
            <span className="text-sm text-white/70 block mb-2">{t("profile.toneDivina")}</span>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map((tn) => (
                <button
                  key={tn.value}
                  onClick={() => handleToneChange(tn.value)}
                  className={`rounded-xl border p-2.5 text-left transition-colors ${
                    tone === tn.value
                      ? "border-white/40 bg-white/15"
                      : "border-white/10 bg-white/[0.04] hover:bg-white/8"
                  }`}
                >
                  <span className={`block text-xs font-medium ${tone === tn.value ? "text-white" : "text-white/60"}`}>
                    {t(tn.labelKey)}
                  </span>
                  <span className="block text-[10px] text-white/35 mt-0.5 leading-tight">{t(tn.descKey)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">{t("profile.notifications")}</span>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  notifications ? "bg-white/60" : "bg-white/10"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    notifications ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">{t("profile.morningReminder")}</span>
            <button
              onClick={() => setDailyReminder(!dailyReminder)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                dailyReminder ? "bg-white/60" : "bg-white/10"
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  dailyReminder ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
          <div className="border-t border-white/10 pt-3">
            <button className="w-full rounded-xl bg-white/8 border border-white/15 py-3 text-sm font-medium text-white/60 hover:bg-white/12 transition-colors">
              {t("profile.goPremium")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
