"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      // If Supabase is not configured, fall back to localStorage-only flow
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const onboarded = localStorage.getItem("divina_onboarded");
        router.replace(onboarded ? "/today" : "/onboarding");
        return;
      }

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth");
        return;
      }

      const onboarded = localStorage.getItem("divina_onboarded");
      if (onboarded) {
        router.replace("/today");
      } else {
        router.replace("/onboarding");
      }
    }

    checkAuth();
  }, [router]);

  return null;
}
