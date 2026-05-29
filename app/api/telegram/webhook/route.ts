import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID!;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function call(method: string, body: object) {
  return fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function send(chatId: number | string, text: string, extra?: object) {
  return call("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...extra,
  });
}

const PLANS_KEYBOARD = {
  inline_keyboard: [
    [{ text: "📅 Месяц — 499 ₽", callback_data: "plan_month" }],
    [{ text: "🌟 Год — 2 490 ₽  (−58%)", callback_data: "plan_year" }],
  ],
};

// Always return 200 so Telegram doesn't retry
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // ── Inline button pressed ──────────────────────────────────────────────
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.from.id;
      const firstName = cb.from.first_name ?? "";
      const data: string = cb.data ?? "";

      await call("answerCallbackQuery", { callback_query_id: cb.id });

      const plans: Record<string, { label: string; price: string }> = {
        plan_month: { label: "Месячная подписка", price: "499 ₽" },
        plan_year:  { label: "Годовая подписка",  price: "2 490 ₽" },
      };

      const plan = plans[data];
      if (plan) {
        // Notify admin
        if (ADMIN_CHAT_ID) {
          await send(
            ADMIN_CHAT_ID,
            `💳 <b>Новый запрос</b>\n\nПлан: ${plan.label} (${plan.price})\nИмя: ${firstName}\nChat ID: <code>${chatId}</code>`,
          );
        }

        await send(
          chatId,
          `✅ Вы выбрали <b>${plan.label} — ${plan.price}</b>\n\nОтправьте ваш <b>email</b> — мы пришлём ссылку на оплату:`,
          { reply_markup: { force_reply: true, input_field_placeholder: "example@mail.ru" } },
        );
      }
      return NextResponse.json({ ok: true });
    }

    // ── Text message ───────────────────────────────────────────────────────
    if (update.message) {
      const msg = update.message;
      const chatId: number = msg.chat.id;
      const text: string = msg.text ?? "";
      const firstName: string = msg.from?.first_name ?? "друг";

      // /start
      if (text.startsWith("/start")) {
        await send(
          chatId,
          `👋 Привет, ${firstName}!\n\n✨ <b>Divina Pro</b> — персональные прогнозы без ограничений.\n\n📅 <b>Месяц</b> — 499 ₽\n🌟 <b>Год</b> — 2 490 ₽ (экономия 58%)\n\nВыберите план:`,
          { reply_markup: PLANS_KEYBOARD },
        );
        return NextResponse.json({ ok: true });
      }

      // Email reply — looks like email
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());
      if (isEmail) {
        // Determine plan from reply_to message if available
        const replyText: string = msg.reply_to_message?.text ?? "";
        const planHint = replyText.includes("Годовая") ? "Год — 2 490 ₽"
          : replyText.includes("Месячная") ? "Месяц — 499 ₽"
          : "не указан";

        if (ADMIN_CHAT_ID) {
          await send(
            ADMIN_CHAT_ID,
            `📧 <b>Email от пользователя</b>\n\nEmail: <code>${text.trim()}</code>\nПлан: ${planHint}\nИмя: ${firstName}\nChat ID: <code>${chatId}</code>\n\nОтправь ссылку на оплату и после подтверждения — код активации.`,
          );
        }

        await send(
          chatId,
          `✅ Заявка принята!\n\nМы отправим ссылку на оплату в ближайшее время.\n\nПосле оплаты вы получите <b>код активации</b> — введите его в приложении Divina.`,
        );
        return NextResponse.json({ ok: true });
      }

      // Anything else — show plans
      await send(
        chatId,
        `Выберите план подписки:`,
        { reply_markup: PLANS_KEYBOARD },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[TG webhook]", e);
    return NextResponse.json({ ok: true }); // Always 200
  }
}
