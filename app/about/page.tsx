export default function AboutPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0824",
      color: "white",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

      {/* Hero */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center",
        padding: "80px 24px 60px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%)",
      }}>
        <div style={{
          display: "inline-flex", width: 72, height: 72,
          alignItems: "center", justifyContent: "center",
          borderRadius: 20, background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)", marginBottom: 24,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
          </svg>
        </div>

        <h1 style={{ fontSize: 38, fontWeight: 800, margin: "0 0 16px", lineHeight: 1.15, maxWidth: 560 }}>
          Ваш ритм жизни<br />становится предсказуемым
        </h1>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", maxWidth: 480, lineHeight: 1.65, margin: "0 0 36px" }}>
          Divina анализирует ваши личные циклы и показывает, когда лучше действовать, а когда — сделать паузу. Каждый день, каждую неделю, на год вперёд.
        </p>

        <a href="https://apps.apple.com/app/divina" style={{
          display: "inline-block",
          background: "white", color: "#0f0824",
          fontWeight: 700, fontSize: 16,
          padding: "14px 32px", borderRadius: 14,
          textDecoration: "none",
          boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
        }}>
          Скачать бесплатно
        </a>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              icon: "◎",
              title: "Ежедневный прогноз",
              desc: "Персональные ориентиры на каждый день — когда действовать, когда замедлиться, когда принимать важные решения.",
            },
            {
              icon: "⬡",
              title: "Недельный план",
              desc: "Видите всю неделю заранее: самые сильные дни, дни для отдыха, потенциальные вызовы.",
            },
            {
              icon: "◈",
              title: "Годовой расклад",
              desc: "Личная карта года — ключевые периоды, благоприятные окна для важных решений, циклы роста.",
            },
            {
              icon: "◇",
              title: "Транзиты",
              desc: "Отслеживайте, как текущие циклы влияют именно на вас — в любви, работе, здоровье, финансах.",
            },
            {
              icon: "◉",
              title: "Карта рождения",
              desc: "Глубокий анализ вашей личности: сильные стороны, жизненные паттерны, скрытые ресурсы.",
            },
            {
              icon: "◫",
              title: "Совместимость",
              desc: "Анализ отношений с близкими людьми — поймите динамику и найдите точки опоры.",
            },
          ].map((f, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: "20px 24px",
              display: "flex", gap: 16, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 22, marginTop: 2, flexShrink: 0, opacity: 0.7 }}>{f.icon}</span>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>{f.title}</p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div style={{
        maxWidth: 640, margin: "0 auto", padding: "0 24px 80px",
      }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: "center", margin: "0 0 8px" }}>
          Divina Pro
        </h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 15, margin: "0 0 32px" }}>
          7 дней бесплатно — затем выберите план
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Yearly */}
          <div style={{
            position: "relative",
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.30)",
            borderRadius: 18, padding: "20px 22px",
          }}>
            <div style={{
              position: "absolute", top: -11, right: 18,
              background: "rgba(139,92,246,0.85)", borderRadius: 99,
              padding: "3px 12px", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.05em", color: "white",
            }}>
              ВЫГОДНО −58%
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px" }}>Годовая подписка</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>≈ 47 ₽ / неделя</p>
              </div>
              <p style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
                2 490 ₽<span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.4)" }}> / год</span>
              </p>
            </div>
          </div>

          {/* Monthly */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 18, padding: "20px 22px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px" }}>Месячная подписка</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>≈ 125 ₽ / неделя</p>
              </div>
              <p style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
                499 ₽<span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.4)" }}> / мес</span>
              </p>
            </div>
          </div>
        </div>

        {/* Perks list */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: "20px 22px", marginTop: 14,
        }}>
          {[
            "Ежедневные прогнозы без ограничений",
            "Недельный план на каждую неделю",
            "Годовой расклад",
            "Отслеживание транзитов",
            "5 проверок совместимости в месяц",
            "Полный разбор карты рождения",
            "Без рекламы",
          ].map((perk, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: i < 6 ? 12 : 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{perk}</span>
            </div>
          ))}
        </div>

        <a href="https://apps.apple.com/app/divina" style={{
          display: "block", textAlign: "center",
          background: "white", color: "#0f0824",
          fontWeight: 700, fontSize: 16,
          padding: "16px 0", borderRadius: 14, marginTop: 20,
          textDecoration: "none",
          boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
        }}>
          Начать бесплатно — 7 дней
        </a>

        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 12 }}>
          Подписка автоматически продлевается. Отмена в любое время в настройках Apple ID.
        </p>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "24px",
        display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap",
      }}>
        {[
          { label: "Поддержка", href: "/support" },
          { label: "Политика конфиденциальности", href: "/privacy" },
        ].map((l) => (
          <a key={l.href} href={l.href} style={{
            fontSize: 13, color: "rgba(255,255,255,0.35)",
            textDecoration: "none",
          }}>{l.label}</a>
        ))}
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()} Divina</span>
      </div>

    </div>
  );
}
