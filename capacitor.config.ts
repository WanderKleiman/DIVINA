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
    contentInset: "automatic",
    preferredContentMode: "mobile",
    backgroundColor: "#070415",
  },
  android: {
    backgroundColor: "#070415",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#070415",
      androidSplashResourceName: "splash",
      iosSplashResourceName: "Splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#070415",
      overlaysWebView: false,
    },
  },
};

export default config;
