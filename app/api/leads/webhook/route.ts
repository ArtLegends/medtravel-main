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
    const ct = req.headers.get("content-type") ?? "";
    let rawBody: any;
    try {
      const text = await req.text();
      console.log("[webhook] RAW BODY:", text);
      console.log("[webhook] Content-Type:", ct);
      rawBody = JSON.parse(text);
    } catch {
      rawBody = { _raw_parse_failed: true };
    }
    console.log("[webhook] PARSED:", JSON.stringify(rawBody));
    // Return 200 so Flexbe doesn't retry
    return NextResponse.json({ ok: true, debug: true, received: rawBody }, { status: 200 });
  } catch (e: any) {
    console.error("[webhook] Error:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!verifyToken(req)) return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  return NextResponse.json({ ok: true, message: "Webhook active. Supports Flexbe API and generic JSON." });
}