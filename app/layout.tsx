import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import BackgroundSwitcher from "@/components/BackgroundSwitcher";
import BottomNav from "@/components/BottomNav";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Divina",
  description: "Your personal forecast",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f0a1e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <LanguageProvider>
          <BackgroundSwitcher />
          <div className="relative z-10">
            <div className="mx-auto min-h-dvh max-w-lg pb-24">
              {children}
            </div>
          </div>
          <BottomNav />
        </LanguageProvider>
      </body>
    </html>
  );
}
