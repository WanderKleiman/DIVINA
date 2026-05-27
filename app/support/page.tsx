export default function SupportPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0824",
      color: "white",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
    }}>
      <div style={{ maxWidth: 520, width: "100%" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", width: 64, height: 64,
            alignItems: "center", justifyContent: "center",
            borderRadius: 18,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            marginBottom: 16,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Divina Support</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
            We&apos;re here to help
          </p>
        </div>

        {/* Contact card */}
        <div style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 20,
          padding: 28,
          marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 12px" }}>Contact Us</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: "0 0 20px" }}>
            Have a question, found a bug, or need help with your subscription?
            Send us an email and we&apos;ll get back to you within 24 hours.
          </p>
          <a
            href="mailto:workspace.kleiman@gmail.com"
            style={{
              display: "inline-block",
              background: "white",
              color: "#0f0824",
              fontWeight: 600,
              fontSize: 15,
              padding: "12px 24px",
              borderRadius: 12,
              textDecoration: "none",
            }}
          >
            workspace.kleiman@gmail.com
          </a>
        </div>

        {/* FAQ */}
        <div style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 20,
          padding: 28,
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 20px" }}>Common Questions</h2>

          {[
            {
              q: "How do I cancel my subscription?",
              a: "Open the Settings app on your iPhone → tap your name → Subscriptions → Divina → Cancel Subscription.",
            },
            {
              q: "I was charged but the app shows Free plan",
              a: "Open Divina, go to your Profile and tap 'Restore Purchases'. If the issue persists, email us.",
            },
            {
              q: "How does the free trial work?",
              a: "Your 7-day free trial starts immediately. You won't be charged until the trial ends. Cancel anytime before it ends to avoid any charge.",
            },
            {
              q: "Can I use Divina on multiple devices?",
              a: "Yes. Sign in with the same Apple ID and restore your purchases to access Pro on any device.",
            },
          ].map((item, i, arr) => (
            <div key={i} style={{ marginBottom: i < arr.length - 1 ? 20 : 0 }}>
              <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>{item.q}</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.25)", marginTop: 32 }}>
          © {new Date().getFullYear()} Divina
        </p>
      </div>
    </div>
  );
}
