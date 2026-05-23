import type { CapacitorConfig } from "@capacitor/cli";

// Production URL — change to your deployed Vercel/custom domain
const PRODUCTION_URL = process.env.CAPACITOR_SERVER_URL || "https://divina-git-main-alex-divina-s-projects.vercel.app";

const config: CapacitorConfig = {
  appId: "app.divina",
  appName: "Divina",
  webDir: "out",
  server: {
    // When CAPACITOR_SERVER_URL is set, the app loads from there (remote web app).
    // Remove this block to use bundled static files instead.
    ...(PRODUCTION_URL ? { url: PRODUCTION_URL } : {}),
    androidScheme: "https",
    cleartext: false,
  },
  ios: {
    // "never" = WebView fills the full screen including under status bar / Dynamic Island
    // CSS env(safe-area-inset-*) then provides the correct inset values
    contentInset: "never",
    preferredContentMode: "mobile",
    backgroundColor: "#0f0824",
  },
  android: {
    backgroundColor: "#0f0824",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#0f0824",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      // LIGHT = white icons/time on dark background
      style: "LIGHT",
      // overlaysWebView: true lets the WebView render behind the status bar
      // so viewport-fit=cover + env(safe-area-inset-top) work correctly
      overlaysWebView: true,
    },
  },
};

export default config;
