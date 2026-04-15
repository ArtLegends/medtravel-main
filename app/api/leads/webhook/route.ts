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

/**
 * Parse Flexbe form-urlencoded webhook.
 * Flexbe sends: application/x-www-form-urlencoded with nested bracket notation:
 *   event=lead
 *   data[client][name]=John
 *   data[client][phone]=+7 (123) 4567890
 *   data[client][email]=
 *   data[page][url]=https://lp.medtravel.me/short/
 *   data[form_name]=Заявка
 */
function parseFlexbeFormData(fd: FormData) {
  const full_name = (
    fd.get("data[client][name]") ??
    fd.get("data[form_data][name][value]") ??
    ""
  ).toString().trim();

  // Clean phone: remove formatting like "+7 (123) 4567890" → "+71234567890"
  const rawPhone = (
    fd.get("data[client][phone]") ??
    fd.get("data[form_data][phone][value]") ??
    ""
  ).toString().trim();
  const phone = rawPhone.replace(/[\s()\-]/g, "");

  const email = (
    fd.get("data[client][email]") ?? ""
  ).toString().trim().toLowerCase() || null;

  // Source from page URL
  const pageUrl = (fd.get("data[page][url]") ?? "").toString();
  let source = "flexbe";
  if (pageUrl.includes("/short")) source = "flexbe-short";
  else if (pageUrl.includes("/quiz")) source = "flexbe-quiz";

  return { full_name, phone, email, source, pageUrl };
}

export async function POST(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  try {
    const ct = req.headers.get("content-type") ?? "";
    let full_name = "";
    let phone = "";
    let email: string | null = null;
    let source = "external-lp";
    let pageUrl = "";

    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      // Flexbe sends form-urlencoded
      const fd = await req.formData();
      const parsed = parseFlexbeFormData(fd);
      full_name = parsed.full_name;
      phone = parsed.phone;
      email = parsed.email;
      source = parsed.source;
      pageUrl = parsed.pageUrl;
    } else {
      // JSON fallback
      const body = await req.json().catch(() => ({}));
      full_name = String(body.full_name || body.name || body["Имя"] || "").trim();
      phone = String(body.phone || body.Phone || body["Телефон"] || "").trim().replace(/[\s()\-]/g, "");
      email = String(body.email || "").trim().toLowerCase() || null;
      source = String(body.source || "external-lp").trim();
    }

    // Validate
    if (!full_name && !phone) {
      return NextResponse.json({ error: "No name or phone received" }, { status: 400 });
    }

    // Tracking
    const userAgent = req.headers.get("user-agent") || "";
    let device_type: string | null = null;
    if (userAgent) {
      const ua = userAgent.toLowerCase();
      if (/tablet|ipad/i.test(ua)) device_type = "Tablet";
      else if (/mobile|iphone|android.*mobile/i.test(ua)) device_type = "Mobile";
      else device_type = "Desktop";
    }
    const user_country = req.headers.get("x-vercel-ip-country") || null;

    let referrer_domain: string | null = null;
    if (pageUrl) {
      try { referrer_domain = new URL(pageUrl).hostname.replace(/^www\./, ""); } catch {}
    }

    // Insert lead
    const supabase = createServiceClient();
    const leadId = globalThis.crypto.randomUUID();

    const insertData: Record<string, any> = {
      id: leadId,
      source,
      full_name: full_name || "Unknown",
      phone: phone || null,
      email,
      age: null,
      status: "new",
    };
    if (device_type) insertData.device_type = device_type;
    if (user_country) insertData.user_country = user_country;
    if (referrer_domain) insertData.referrer_domain = referrer_domain;

    const { error: insErr } = await supabase.from("partner_leads").insert(insertData);

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // Auto-assign
    const origin = req.nextUrl.origin || "https://medtravel.me";
    await autoAssignLead({ leadId, origin });

    return NextResponse.json({ ok: true, id: leadId }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!verifyToken(req)) return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  return NextResponse.json({ ok: true, message: "Webhook active. Supports Flexbe and generic JSON." });
}