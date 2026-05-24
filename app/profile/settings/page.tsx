"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BirthDataForm from "@/components/profile/BirthDataForm";
import SettingsSection from "@/components/profile/SettingsSection";
import { getUserData } from "@/lib/user-data";
import type { User } from "@/lib/types";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = getUserData();
    setUser({
      name: userData.name,
      streak: 12,
      birthDate: userData.birthDate,
      birthTime: userData.birthTime,
      birthCity: userData.birthCity,
      subscription: "free",
    });
  }, []);

  if (!user) return null; // avoid SSR flash with wrong defaults

  return (
    <div className="stagger flex flex-col gap-4">
      {/* Header with back button */}
      <div className="animate-fade-in-up flex items-center gap-3 px-5 pt-4 pb-2">
        <Link
          href="/profile"
          className="glass flex h-10 w-10 items-center justify-center rounded-full text-white/30 transition hover:text-white/60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-xl font-medium text-white">Настройки</h1>
      </div>

      <div className="animate-fade-in-up">
        <BirthDataForm user={user!} />
      </div>

      <div className="animate-fade-in-up">
        <SettingsSection />
      </div>
    </div>
  );
}
