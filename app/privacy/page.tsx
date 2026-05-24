export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", color: "#1a1a1a", lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 40 }}>Last updated: May 24, 2026</p>

      <p>Divina ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use the Divina app.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 12 }}>1. Information We Collect</h2>
      <p>We collect the following information that you provide directly:</p>
      <ul style={{ paddingLeft: 24, marginTop: 8 }}>
        <li><strong>Birth data</strong> — date, time, and place of birth, used solely to calculate your astrological chart and personalized forecasts.</li>
        <li><strong>Name</strong> — used to personalize your in-app experience.</li>
        <li><strong>Tone preference</strong> — your preferred communication style within the app.</li>
      </ul>
      <p style={{ marginTop: 12 }}>We do <strong>not</strong> require you to create an account or provide an email address to use the app.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 12 }}>2. How We Use Your Information</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li>To calculate and display your personalized astrological chart, daily forecasts, and readings.</li>
        <li>To generate AI-powered interpretations based on your birth data.</li>
        <li>To personalize the app experience (name, tone preferences).</li>
        <li>To process subscription payments via Apple In-App Purchase.</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 12 }}>3. Data Storage</h2>
      <p>Your personal data (name, birth date, birth time, birth location, tone preference) is stored <strong>locally on your device</strong> using the device's local storage. We do not store your personal data on our servers.</p>
      <p style={{ marginTop: 12 }}>Astrological interpretations and forecasts are generated on demand and cached locally on your device for performance.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 12 }}>4. Third-Party Services</h2>
      <p>We use the following third-party services:</p>
      <ul style={{ paddingLeft: 24 }}>
        <li><strong>OpenAI</strong> — to generate personalized astrological interpretations. Your birth data (date, time, location, zodiac signs) is sent to OpenAI's API for this purpose. OpenAI's privacy policy is available at <a href="https://openai.com/privacy" style={{ color: "#6366f1" }}>openai.com/privacy</a>.</li>
        <li><strong>RevenueCat</strong> — to manage subscriptions and in-app purchases. RevenueCat processes purchase data in accordance with their privacy policy at <a href="https://www.revenuecat.com/privacy" style={{ color: "#6366f1" }}>revenuecat.com/privacy</a>.</li>
        <li><strong>Apple App Store</strong> — subscription billing is handled by Apple. Apple's privacy policy applies to all payment processing.</li>
        <li><strong>Vercel</strong> — our app backend runs on Vercel's infrastructure. Requests to generate forecasts pass through Vercel's servers. Vercel's privacy policy is available at <a href="https://vercel.com/legal/privacy-policy" style={{ color: "#6366f1" }}>vercel.com/legal/privacy-policy</a>.</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 12 }}>5. Data We Do Not Collect</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li>We do not collect your email address or phone number.</li>
        <li>We do not track your location in real time.</li>
        <li>We do not use advertising networks or sell your data to third parties.</li>
        <li>We do not collect device identifiers for advertising purposes.</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 12 }}>6. Subscriptions</h2>
      <p>Divina offers auto-renewable subscriptions (Divina Pro). Subscriptions are managed and billed by Apple through the App Store. You can cancel your subscription at any time through your Apple ID account settings. Subscription prices are displayed before purchase.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 12 }}>7. Children's Privacy</h2>
      <p>Divina is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 12 }}>8. Your Rights</h2>
      <p>Since your personal data is stored locally on your device, you can delete it at any time by uninstalling the app. This will permanently remove all your data from your device.</p>
      <p style={{ marginTop: 12 }}>If you have questions about your data or wish to request deletion of any data processed by our servers, contact us at the email below.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 12 }}>9. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this page.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 36, marginBottom: 12 }}>10. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us:</p>
      <p style={{ marginTop: 8 }}><strong>Email:</strong> <a href="mailto:workspace.kleiman@gmail.com" style={{ color: "#6366f1" }}>workspace.kleiman@gmail.com</a></p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e5e5e5", color: "#999", fontSize: 13 }}>
        © 2026 Divina. All rights reserved.
      </div>
    </div>
  );
}
