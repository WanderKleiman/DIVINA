import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/ru/activate
 * Body: { code: string }
 *
 * Checks code against ACTIVATION_CODES env var (comma-separated).
 * Format: plain codes → 365 days, e.g. "ABC123,DEF456"
 * Or with duration: "ABC123:365,DEF456:30" (days after colon)
 *
 * Returns: { success: true, durationDays: number } | { success: false, error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ success: false, error: "Код не указан" }, { status: 400 });
    }

    const normalized = code.trim().toUpperCase();

    const raw = process.env.ACTIVATION_CODES ?? "";
    if (!raw) {
      return NextResponse.json({ success: false, error: "Коды не настроены" }, { status: 500 });
    }

    // Parse "CODE:DAYS" or just "CODE" (default 365 days)
    const entries = raw.split(",").map(s => {
      const [c, d] = s.trim().toUpperCase().split(":");
      return { code: c, days: d ? parseInt(d, 10) : 365 };
    });

    const match = entries.find(e => e.code === normalized);
    if (!match) {
      return NextResponse.json({ success: false, error: "Неверный код активации" }, { status: 200 });
    }

    return NextResponse.json({ success: true, durationDays: match.days });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
