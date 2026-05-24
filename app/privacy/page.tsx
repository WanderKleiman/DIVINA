export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0f0824", padding: "48px 24px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 24, padding: "36px 32px", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: "white" }}>Privacy Policy</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 36 }}>Last updated: May 24, 2026</p>

        <p>Divina ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use the Divina app.</p>

        <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 32, marginBottom: 10, color: "white" }}>1. Information We Collect</h2>
        <p>We collect the following information that you provide directly:</p>
        <ul style={{ paddingLeft: 22, marginTop: 8, color: "rgba(255,255,255,0.75)" }}>
          <li style={{ marginBottom: 6 }}><strong style={{ color: "white" }}>Birth data</strong> — date, time, and place of birth, used solely to calculate your astrological chart and personalized forecasts.</li>
          <li style={{ marginBottom: 6 }}><strong style={{ color: "white" }}>Name</strong> — used to personalize your in-app experience.</li>
          <li><strong style={{ color: "white" }}>Tone preference</strong> — your preferred communication style within the app.</li>
        </ul>
        <p style={{ marginTop: 12 }}>We do <strong style={{ color: "white" }}>not</strong> require you to create an account or provide an email address to use the app.</p>

        <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 32, marginBottom: 10, color: "white" }}>2. How We Use Your Information</h2>
        <ul style={{ paddingLeft: 22, color: "rgba(255,255,255,0.75)" }}>
          <li style={{ marginBottom: 6 }}>To calculate and display your personalized astrological chart, daily forecasts, and readings.</li>
          <li style={{ marginBottom: 6 }}>To generate AI-powered interpretations based on your birth data.</li>
          <li style={{ marginBottom: 6 }}>To personalize the app experience (name, tone preferences).</li>
          <li>To process subscription payments via Apple In-App Purchase.</li>
        </ul>

        <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 32, marginBottom: 10, color: "white" }}>3. Data Storage</h2>
        <p>Your personal data (name, birth date, birth time, birth location, tone preference) is stored <strong style={{ color: "white" }}>locally on your device</strong> using the device's local storage. We do not store your personal data on our servers.</p>
        <p style={{ marginTop: 12 }}>Astrological interpretations and forecasts are generated on demand and cached locally on your device for performance.</p>

        <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 32, marginBottom: 10, color: "white" }}>4. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul style={{ paddingLeft: 22, color: "rgba(255,255,255,0.75)" }}>
          <li style={{ marginBottom: 6 }}><strong style={{ color: "white" }}>OpenAI</strong> — to generate personalized astrological interpretations. Your birth data is sent to OpenAI's API. <a href="https://openai.com/privacy" style={{ color: "#a78bfa" }}>openai.com/privacy</a></li>
          <li style={{ marginBottom: 6 }}><strong style={{ color: "white" }}>RevenueCat</strong> — to manage subscriptions. <a href="https://www.revenuecat.com/privacy" style={{ color: "#a78bfa" }}>revenuecat.com/privacy</a></li>
          <li style={{ marginBottom: 6 }}><strong style={{ color: "white" }}>Apple App Store</strong> — subscription billing is handled by Apple.</li>
          <li><strong style={{ color: "white" }}>Vercel</strong> — our backend infrastructure. <a href="https://vercel.com/legal/privacy-policy" style={{ color: "#a78bfa" }}>vercel.com/legal/privacy-policy</a></li>
        </ul>

        <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 32, marginBottom: 10, color: "white" }}>5. Data We Do Not Collect</h2>
        <ul style={{ paddingLeft: 22, color: "rgba(255,255,255,0.75)" }}>
          <li style={{ marginBottom: 6 }}>We do not collect your email address or phone number.</li>
          <li style={{ marginBottom: 6 }}>We do not track your location in real time.</li>
          <li style={{ marginBottom: 6 }}>We do not use advertising networks or sell your data to third parties.</li>
          <li>We do not collect device identifiers for advertising purposes.</li>
        </ul>

        <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 32, marginBottom: 10, color: "white" }}>6. Subscriptions</h2>
        <p>Divina offers auto-renewable subscriptions (Divina Pro). Subscriptions are managed and billed by Apple through the App Store. You can cancel at any time through your Apple ID account settings.</p>

        <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 32, marginBottom: 10, color: "white" }}>7. Children's Privacy</h2>
        <p>Divina is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13.</p>

        <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 32, marginBottom: 10, color: "white" }}>8. Your Rights</h2>
        <p>Since your personal data is stored locally on your device, you can delete it at any time by uninstalling the app. For questions about data processed by our servers, contact us below.</p>

        <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 32, marginBottom: 10, color: "white" }}>9. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you by updating the "Last updated" date at the top of this page.</p>

        <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 32, marginBottom: 10, color: "white" }}>10. Contact Us</h2>
        <p>If you have any questions, please contact us:</p>
        <p style={{ marginTop: 8 }}><a href="mailto:workspace.kleiman@gmail.com" style={{ color: "#a78bfa" }}>workspace.kleiman@gmail.com</a></p>

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
          © 2026 Divina. All rights reserved.
        </div>
      </div>
    </div>
  );
}
