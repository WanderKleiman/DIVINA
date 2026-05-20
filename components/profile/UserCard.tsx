"use client";

import ZodiacIcon from "@/components/icons/ZodiacIcon";
import type { User } from "@/lib/types";

interface UserCardProps {
  user: User;
  sunSign: string;
  sunSignSymbol: string;
}

export default function UserCard({ user, sunSign, sunSignSymbol }: UserCardProps) {
  return (
    <div className="px-5 pt-2 pb-1 flex items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.07] border border-white/10">
        <ZodiacIcon sign={sunSignSymbol} size={30} className="text-white/80" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white leading-tight">{user.name}</h1>
        <p className="text-sm text-white/50 mt-0.5">{sunSign}</p>
      </div>
    </div>
  );
}
