"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";

const tabIds = [
  {
    id: "today",
    key: "nav.today",
    href: "/today",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
  {
    id: "weekly",
    key: "nav.week",
    href: "/weekly",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <path d="M7 14h3M14 14h3M7 18h3" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "for-you",
    key: "nav.forYou",
    href: "/for-you",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
      </svg>
    ),
  },
  {
    id: "calendar",
    key: "nav.calendar",
    href: "/calendar",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "profile",
    key: "nav.profile",
    href: "/profile",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useT();

  // Hide on onboarding/auth and on immersive full-screen story pages
  if (
    pathname === "/onboarding" ||
    pathname === "/auth" ||
    pathname === "/profile/personality" ||
    pathname === "/for-you/periods"
  ) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-t border-white/10">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {tabIds.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`relative flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-white/30 hover:text-white/50"
                }`}
              >
                {tab.icon}
                <span className="mt-0.5 whitespace-nowrap">{t(tab.key)}</span>
                {isActive && (
                  <div className="absolute top-0 h-0.5 w-8 rounded-full bg-white/80" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
