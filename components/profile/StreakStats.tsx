"use client";

import { useT } from "@/lib/i18n";

interface StreakStatsProps {
  streak: number;
}

export default function StreakStats({ streak }: StreakStatsProps) {
  const { t } = useT();

  const stats = [
    { label: t("profile.currentStreak"), value: `${streak} ${t("profile.days")}` },
    { label: t("profile.bestStreak"), value: `${streak + 5} ${t("profile.days")}` },
    { label: t("profile.totalForecasts"), value: "47" },
    { label: t("profile.withUsSince"), value: `${t("month.3")} 2026` },
  ];

  return (
    <div className="glass mx-5">
      <div className="relative z-10 p-4">
        <h3 className="font-medium tracking-wide text-white mb-3">{t("profile.stats")}</h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
              <p className="text-sm font-medium text-white/80 mt-1">{s.value}</p>
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
