"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setLoading("google");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading("");
    }
  }

  async function handleApple() {
    setLoading("apple");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading("");
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading("email");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading("");
    } else {
      setSent(true);
      setLoading("");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl font-bold text-glow mb-2">Divina</h1>
          <p className="text-sm text-white/40">Your personal forecast</p>
        </div>

        {sent ? (
          <div className="glass-strong rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">✉️</div>
            <p className="text-white/80 text-sm mb-1">Check your email</p>
            <p className="text-white/40 text-xs">{email}</p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-xs text-white/40 underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white/90 py-4 text-base font-semibold text-black/80 active:bg-white/70 transition-colors disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading === "google" ? "..." : "Sign in with Google"}
            </button>

            {/* Apple */}
            <button
              onClick={handleApple}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white/10 border border-white/15 py-4 text-base font-semibold text-white active:bg-white/15 transition-colors disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              {loading === "apple" ? "..." : "Sign in with Apple"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email */}
            <form onSubmit={handleEmail} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-2xl bg-white/[0.08] border border-white/15 px-5 py-4 text-base text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
              />
              <button
                type="submit"
                disabled={!email.trim() || !!loading}
                className="w-full rounded-2xl bg-white/15 border border-white/20 py-4 text-base font-semibold text-white active:bg-white/20 transition-colors disabled:opacity-40"
              >
                {loading === "email" ? "..." : "Continue"}
              </button>
            </form>

            {error && (
              <p className="text-xs text-red-400/70 text-center">{error}</p>
            )}

            {/* Terms */}
            <p className="text-[10px] text-white/20 text-center leading-relaxed pt-2">
              By continuing, you agree to the Terms of Service and Privacy Policy
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
