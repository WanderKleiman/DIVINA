"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import type { PersonalityBreakdown } from "@/lib/ai-interpret";

interface Props {
  data: PersonalityBreakdown;
}

export default function PersonalityBreakdown({ data }: Props) {
  const router = useRouter();
  const { t } = useT();

  if (!data?.narrative && !data?.essence) return null;

  const teaser = data.narrative?.split("\n\n")[0]?.trim() ?? "";
  const teaserShort = teaser.length > 180 ? teaser.slice(0, 180).trimEnd() + "…" : teaser;

  return (
    <div className="mx-5">
      <div className="px-1 mb-3">
        <h2 className="text-lg font-semibold text-white/90">{t("profile.personalityTitle")}</h2>
        <p className="text-xs text-white/40 mt-0.5">{t("profile.personalitySubtitle")}</p>
      </div>

      <button
        onClick={() => router.push("/profile/personality")}
        className="w-full text-left glass-strong rounded-2xl p-5 active:scale-[0.99] transition-transform"
      >
        <h3 className="text-xl font-bold text-white leading-tight mb-3">{data.essence}</h3>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {(data.keywords ?? []).slice(0, 6).map((kw, i) => (
            <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-white/75">
              {kw}
            </span>
          ))}
        </div>

        {teaserShort && (
          <p className="text-sm text-white/70 leading-relaxed mb-4">{teaserShort}</p>
        )}

        <div className="mt-2">
          <span className="inline-flex items-center gap-1.5 bg-white text-black text-xs font-medium px-4 py-2 rounded-xl">
            {t("profile.readMore")}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>
      </button>
    </div>
  );
}
