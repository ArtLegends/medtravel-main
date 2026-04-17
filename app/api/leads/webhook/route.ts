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
 * Fields use bracket notation: data[client][name], data[form_data][field_id][value], etc.
 */
function parseFlexbeFormData(fd: FormData) {
  const full_name = (
    fd.get("data[client][name]") ??
    fd.get("data[form_data][name][value]") ??
    ""
  ).toString().trim();

  const rawPhone = (
    fd.get("data[client][phone]") ??
    fd.get("data[form_data][phone][value]") ??
    ""
  ).toString().trim();
  const phone = rawPhone.replace(/[\s()\-]/g, "");

  const email = (
    fd.get("data[client][email]") ?? ""
  ).toString().trim().toLowerCase() || null;

  const pageUrl = (fd.get("data[page][url]") ?? "").toString();
  let source = "flexbe";
  if (pageUrl.includes("/short")) source = "flexbe-short";
  else if (pageUrl.includes("/quiz")) source = "flexbe-quiz";

  // Extract quiz answers from form_data fields
  // Flexbe sends: data[form_data][field_id][orig_name] and data[form_data][field_id][value]
  const quizAnswers: Array<{ question: string; answer: string }> = [];
  const seenFields = new Set<string>();

  // Iterate all form data entries to find quiz fields
  fd.forEach((value, key) => {
    // Match pattern: data[form_data][FIELD_ID][value]
    const valueMatch = key.match(/^data\[form_data\]\[([^\]]+)\]\[value\]$/);
    if (valueMatch) {
      const fieldId = valueMatch[1];
      if (fieldId === "name" || fieldId === "phone" || fieldId === "email") return; // skip standard fields
      if (seenFields.has(fieldId)) return;
      seenFields.add(fieldId);

      const answer = value.toString().trim();
      if (!answer) return;

      // Get the question name
      const origName = (fd.get(`data[form_data][${fieldId}][orig_name]`) ?? "").toString().trim();
      const fieldName = (fd.get(`data[form_data][${fieldId}][name]`) ?? "").toString().trim();

      quizAnswers.push({
        question: origName || fieldName || fieldId,
        answer,
      });
    }
  });

  // Also extract from note field (Flexbe sometimes puts quiz answers there)
  const note = (fd.get("data[note]") ?? "").toString().trim();

  return { full_name, phone, email, source, pageUrl, quizAnswers, note };
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
    let quizAnswers: Array<{ question: string; answer: string }> = [];
    let note = "";

    const supabase = createServiceClient();

    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const rawText = await req.clone().text();

      // Save raw payload to debug table (temporary — remove after debugging)
      try {
        await supabase.from("_webhook_debug").insert({
          payload: { _raw: rawText },
          headers: { "content-type": ct, "user-agent": req.headers.get("user-agent") },
        });
      } catch {}

      // Re-parse as FormData
      const fd = new URLSearchParams(rawText);
      // Convert to FormData-like interface
      const fakeFormData = {
        get: (key: string) => fd.get(key),
        forEach: (cb: (value: string, key: string) => void) => {
          fd.forEach((value, key) => cb(value, key));
        },
      } as any;

      const parsed = parseFlexbeFormData(fakeFormData);
      full_name = parsed.full_name;
      phone = parsed.phone;
      email = parsed.email;
      source = parsed.source;
      pageUrl = parsed.pageUrl;
      quizAnswers = parsed.quizAnswers;
      note = parsed.note;
    } else {
      const body = await req.json().catch(() => ({}));
      full_name = String(body.full_name || body.name || body["Имя"] || "").trim();
      phone = String(body.phone || body.Phone || body["Телефон"] || "").trim().replace(/[\s()\-]/g, "");
      email = String(body.email || "").trim().toLowerCase() || null;
      source = String(body.source || "external-lp").trim();
    }

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
    if (quizAnswers.length > 0) {
      insertData.quiz_answers = quizAnswers;
    }

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