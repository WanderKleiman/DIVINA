"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ToneOfVoice } from "@/lib/ai-interpret";
import NatalChartWheel from "@/components/chart/NatalChartWheel";
import DatePicker from "@/components/ui/DatePicker";
import TimePicker from "@/components/ui/TimePicker";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import { approximatePlanets, approximateAscendant } from "@/lib/astro-calc";
import { useT } from "@/lib/i18n";
import { createClient } from "@/lib/supabase";

const BTN_CLASS = "w-full rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 py-4 text-base font-semibold text-black/90 active:bg-white/60 transition-colors shadow-[0_4px_24px_rgba(0,0,0,0.5)]";

export default function OnboardingFlow() {
  const router = useRouter();
  const { t } = useT();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [birthTime, setBirthTime] = useState("12:30");
  const [birthCity, setBirthCity] = useState("");
  const [cityLat, setCityLat] = useState<number | null>(null);
  const [cityLng, setCityLng] = useState<number | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneOfVoice>("deep");

  const SLIDE_COUNT = 2; // slides before tone screen
  const isToneStep = step === SLIDE_COUNT;
  const isSlide = step < SLIDE_COUNT;
  const isForm = step === SLIDE_COUNT + 1;

  const canFinish = name.trim() !== "" && birthDate !== "" && birthTime !== "" && birthCity.trim() !== "";

  const TONES: { value: ToneOfVoice; label: string; desc: string; emoji: string }[] = [
    { value: "deep",     label: t("tone.deep"),     desc: t("tone.deep.desc"),     emoji: "🌊" },
    { value: "direct",   label: t("tone.direct"),   desc: t("tone.direct.desc"),   emoji: "⚡" },
    { value: "friendly", label: t("tone.friendly"), desc: t("tone.friendly.desc"), emoji: "☕" },
  ];

  const planets = useMemo(() => {
    const date = new Date(birthDate + "T00:00:00");
    if (isNaN(date.getTime())) return [];
    return approximatePlanets(date);
  }, [birthDate]);

  const ascendant = useMemo(() => {
    const date = new Date(birthDate + "T00:00:00");
    if (isNaN(date.getTime())) return { name: "Овен", symbol: "♈" };
    const hour = birthTime ? parseInt(birthTime.split(":")[0], 10) : 12;
    return approximateAscendant(date, hour);
  }, [birthDate, birthTime]);

  const handleDateChange = useCallback((iso: string) => setBirthDate(iso), []);
  const handleTimeChange = useCallback((time: string) => setBirthTime(time), []);
  const handleCityChange = useCallback((city: string, lat?: number, lng?: number) => {
    setBirthCity(city);
    if (lat != null && lng != null) {
      setCityLat(lat);
      setCityLng(lng);
    }
  }, []);

  function handleNext() {
    if (isSlide) setStep(step + 1);
  }

  async function handleFinish() {
    const tzOffset = cityLng != null ? Math.round(cityLng / 15) : undefined;
    const userData = {
      name,
      birthDate,
      birthTime,
      birthCity,
      lat: cityLat,
      lng: cityLng,
      tzOffset,
      tone: selectedTone,
    };
    localStorage.setItem("divina_user", JSON.stringify(userData));
    localStorage.setItem("divina_onboarded", "true");

    // Save to Supabase if configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").upsert({
            id: user.id,
            name,
            birth_date: birthDate,
            birth_time: birthTime,
            birth_city: birthCity,
            lat: cityLat,
            lng: cityLng,
            tz_offset: tzOffset,
          });
        }
      } catch (err) {
        console.error("Failed to save profile to Supabase:", err);
      }
    }

    router.push("/today");
  }

  const slides = [
    {
      icon: "✦",
      title: t("onboarding.slide1.title"),
      bullets: [
        { bold: t("onboarding.slide1.b1.bold"), text: t("onboarding.slide1.b1.text") },
        { bold: t("onboarding.slide1.b2.bold"), text: t("onboarding.slide1.b2.text") },
        { bold: t("onboarding.slide1.b3.bold"), text: t("onboarding.slide1.b3.text") },
      ],
    },
    {
      title: t("onboarding.slide2.title"),
      description: t("onboarding.slide2.desc"),
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col px-6">
      {isSlide && (
        <>
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="animate-fade-in-up text-center max-w-sm">
              {slides[step].icon && <div className="text-5xl mb-6">{slides[step].icon}</div>}
              <h1 className="text-2xl font-bold text-white mb-3">
                {slides[step].title}
              </h1>
              {slides[step].description && (
                <p className="text-sm leading-relaxed text-white mb-4 whitespace-pre-line">
                  {slides[step].description}
                </p>
              )}
              {slides[step].bullets && (
                <div className="text-left space-y-2.5 mb-6 w-full">
                  {slides[step].bullets!.map((b, i) => (
                    <div key={i} className="rounded-2xl bg-white border border-white/20 px-4 py-3 flex gap-3 items-start shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
                      <span className="text-black/25 shrink-0 mt-0.5 text-base">✦</span>
                      <span className="text-sm leading-relaxed text-black/65">
                        <strong className="text-black/85 font-semibold">{b.bold}</strong> — {b.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pb-10 pt-4 max-w-sm mx-auto w-full">
            <div className="flex items-center justify-center gap-2 mb-6">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-6 bg-white" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
              {/* tone step dot */}
              <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
              {/* form step dot */}
              <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
            </div>
            <button onClick={handleNext} className={BTN_CLASS}>
              {t("onboarding.next")}
            </button>
          </div>
        </>
      )}

      {isToneStep && (
        <div className="flex flex-1 flex-col pt-14 pb-10">
          <div className="animate-fade-in-up w-full max-w-sm mx-auto flex flex-col flex-1">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🎭</div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {t("onboarding.toneTitle")}
              </h1>
              <p className="text-sm text-white/55 leading-relaxed">
                {t("onboarding.toneDesc")}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {TONES.map((tn) => (
                <button
                  key={tn.value}
                  onClick={() => setSelectedTone(tn.value)}
                  className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
                  style={selectedTone === tn.value
                    ? { background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.50)" }
                    : { background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.12)" }
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tn.emoji}</span>
                    <div>
                      <p className={`text-sm font-semibold ${selectedTone === tn.value ? "text-white" : "text-white/70"}`}>
                        {tn.label}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">{tn.desc}</p>
                    </div>
                    {selectedTone === tn.value && (
                      <svg className="ml-auto shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <div>
              <div className="flex items-center justify-center gap-2 mb-5">
                {slides.map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/20" />
                ))}
                <div className="h-1.5 w-6 rounded-full bg-white" />
                <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
              </div>
              <button onClick={() => setStep(step + 1)} className={BTN_CLASS}>
                {t("onboarding.next")}
              </button>
            </div>
          </div>
        </div>
      )}

      {isForm && (
        <div className="flex flex-1 flex-col pt-14 pb-10">
          <div className="animate-fade-in-up w-full max-w-sm mx-auto flex flex-col flex-1">
            <h1 className="text-2xl font-bold text-white mb-2 text-center">
              {t("onboarding.tellAboutYourself")}
            </h1>

            <div className="flex justify-center">
              <div className="scale-75 origin-center -my-5">
                <NatalChartWheel planets={planets} ascendantSymbol={ascendant.symbol} />
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm text-white/50 mb-2 font-medium">
                  {t("profile.birthDate")}
                </label>
                <DatePicker value={birthDate} onChange={handleDateChange} />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-2 font-medium">
                  {t("profile.birthTime")}
                </label>
                <TimePicker value={birthTime} onChange={handleTimeChange} />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-2 font-medium">{t("onboarding.name")}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("onboarding.namePlaceholder")}
                  className="w-full rounded-2xl bg-white/[0.18] border border-white/25 px-5 py-4 text-base text-white placeholder:text-white/40 outline-none focus:border-white/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-2 font-medium">
                  {t("profile.birthCity")}
                </label>
                <CityAutocomplete
                  value={birthCity}
                  onChange={handleCityChange}
                  placeholder={t("onboarding.cityPlaceholder")}
                  className="w-full rounded-2xl bg-white/[0.18] border border-white/25 px-5 py-4 text-base text-white placeholder:text-white/40 outline-none focus:border-white/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex-1" />

            <div>
              <div className="flex items-center justify-center gap-2 mb-5">
                {slides.map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/20" />
                ))}
                <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <div className="h-1.5 w-6 rounded-full bg-white" />
              </div>
              <button
                onClick={handleFinish}
                disabled={!canFinish}
                className={`${BTN_CLASS} disabled:opacity-40`}
              >
                {t("onboarding.start")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
