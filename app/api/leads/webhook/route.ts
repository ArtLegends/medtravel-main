// app/api/leads/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { autoAssignLead } from "@/lib/leads/autoAssign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.LEADS_WEBHOOK_SECRET || "";

function verifyToken(req: NextRequest): boolean {
  if (!WEBHOOK_SECRET) return true;
  const fromQuery = req.nextUrl.searchParams.get("token") ?? "";
  const fromHeader = req.headers.get("x-webhook-secret") ?? "";
  return fromQuery === WEBHOOK_SECRET || fromHeader === WEBHOOK_SECRET;
}

function parseFlexbePayload(body: any) {
  if (!body?.data?.fields || !Array.isArray(body.data.fields)) return null;
  const fields: Array<{ name: string; value: string }> = body.data.fields;
  const get = (...names: string[]) => {
    for (const n of names) {
      const f = fields.find((f) => f.name.toLowerCase().trim() === n.toLowerCase());
      if (f?.value?.trim()) return f.value.trim();
    }
    return "";
  };
  let source = "flexbe";
  const pageUrl = body.data?.page_url || body.data?.url || "";
  if (pageUrl.includes("/short")) source = "flexbe-short";
  else if (pageUrl.includes("/quiz")) source = "flexbe-quiz";
  return {
    full_name: get("Имя", "имя", "Name", "name", "ФИО", "фио", "Ваше имя") || "Unknown",
    phone: get("Телефон", "телефон", "Phone", "phone", "tel", "Номер телефона"),
    email: get("Email", "email", "E-mail", "Почта") || null,
    source,
  };
}

function parseGenericPayload(body: any) {
  const s = (v: any) => String(v ?? "").trim();
  return {
    full_name: s(body.full_name || body.name || body.fullName || body["Имя"]) || "Unknown",
    phone: s(body.phone || body.Phone || body.tel || body["Телефон"]),
    email: s(body.email || body.Email).toLowerCase() || null,
    source: s(body.source || body.utm_source) || "external-lp",
  };
}

export async function POST(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }
  try {
    let rawBody: any;
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      rawBody = await req.json().catch(() => ({}));
    } else if (ct.includes("form")) {
      const fd = await req.formData().catch(() => new FormData());
      const obj: Record<string, string> = {};
      fd.forEach((v, k) => { if (typeof v === "string") obj[k] = v; });
      rawBody = obj;
    } else {
      rawBody = await req.json().catch(() => ({}));
    }

    const parsed = parseFlexbePayload(rawBody) ?? parseGenericPayload(rawBody);

    console.log("[webhook] Received:", JSON.stringify({ format: parseFlexbePayload(rawBody) ? "flexbe" : "generic", parsed, raw_keys: Object.keys(rawBody), event: rawBody?.event }));

    if (!parsed.full_name && !parsed.phone) {
      return NextResponse.json({ error: "At least name or phone is required", received: rawBody }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    let device_type: string | null = null;
    if (userAgent) {
      const ua = userAgent.toLowerCase();
      if (/tablet|ipad/i.test(ua)) device_type = "Tablet";
      else if (/mobile|iphone|android.*mobile/i.test(ua)) device_type = "Mobile";
      else device_type = "Desktop";
    }
    const user_country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || null;
    let referrer_domain: string | null = null;
    const pageUrl = rawBody?.data?.page_url || rawBody?.referrer || req.headers.get("referer") || "";
    if (pageUrl) { try { referrer_domain = new URL(pageUrl).hostname.replace(/^www\./, ""); } catch {} }

    const supabase = createServiceClient();
    const leadId = globalThis.crypto.randomUUID();
    const { error: insErr } = await supabase.from("partner_leads").insert({
      id: leadId, source: parsed.source, full_name: parsed.full_name,
      phone: parsed.phone || null, email: parsed.email, age: null,
      image_paths: [], status: "new", device_type, user_country, referrer_domain,
    });
    if (insErr) { console.error("[webhook] Insert error:", insErr.message); return NextResponse.json({ error: insErr.message }, { status: 500 }); }

    const origin = req.nextUrl.origin || "https://medtravel.me";
    await autoAssignLead({ leadId, origin });
    console.log("[webhook] Lead created:", leadId);
    return NextResponse.json({ ok: true, id: leadId }, { status: 200 });
  } catch (e: any) {
    console.error("[webhook] Error:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!verifyToken(req)) return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  return NextResponse.json({ ok: true, message: "Webhook active. Supports Flexbe API and generic JSON." });
}