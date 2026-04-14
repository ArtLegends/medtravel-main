// app/api/leads/webhook/route.ts
//
// Public webhook for receiving leads from external landing pages (Flexbe, etc.)
// No auth required — protected by secret token in query param or header.
//
// Accepts: POST with JSON or form-encoded body
// Fields: full_name, phone, email (optional), source (optional)
//
// Example Flexbe webhook URL:
//   https://medtravel.me/api/leads/webhook?token=YOUR_SECRET
//
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { autoAssignLead } from "@/lib/leads/autoAssign";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Simple secret token to prevent spam. Set in Vercel env vars.
const WEBHOOK_SECRET = process.env.LEADS_WEBHOOK_SECRET || "";

function verifyToken(req: NextRequest): boolean {
  if (!WEBHOOK_SECRET) return true; // if not configured, allow all (dev mode)
  const fromQuery = req.nextUrl.searchParams.get("token") ?? "";
  const fromHeader = req.headers.get("x-webhook-secret") ?? "";
  return fromQuery === WEBHOOK_SECRET || fromHeader === WEBHOOK_SECRET;
}

async function parseBody(req: NextRequest): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") ?? "";

  // JSON body
  if (ct.includes("application/json")) {
    const json = await req.json().catch(() => ({}));
    return Object.fromEntries(
      Object.entries(json).map(([k, v]) => [k, String(v ?? "")])
    );
  }

  // Form-encoded body (Flexbe sends this by default)
  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    const fd = await req.formData().catch(() => new FormData());
    const result: Record<string, string> = {};
    fd.forEach((v, k) => {
      if (typeof v === "string") result[k] = v;
    });
    return result;
  }

  // Fallback: try JSON
  try {
    const json = await req.json();
    return Object.fromEntries(
      Object.entries(json).map(([k, v]) => [k, String(v ?? "")])
    );
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  // 1) Verify token
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  try {
    const body = await parseBody(req);

    // 2) Extract fields — Flexbe field names may vary, support common variants
    const full_name = (
      body.full_name || body.name || body.fullName || body.Name || body["Имя"] || ""
    ).trim();

    const phone = (
      body.phone || body.Phone || body.tel || body["Телефон"] || body.telephone || ""
    ).trim();

    const email = (
      body.email || body.Email || body["Email"] || ""
    ).trim().toLowerCase() || null;

    const source = (
      body.source || body.utm_source || body.Source || "flexbe-lp"
    ).trim().slice(0, 80);

    // 3) Validate
    if (!full_name && !phone) {
      return NextResponse.json(
        { error: "At least name or phone is required" },
        { status: 400 }
      );
    }

    // 4) Extract tracking data from headers
    const userAgent = req.headers.get("user-agent") || "";
    let device_type: string | null = null;
    if (userAgent) {
      const ua = userAgent.toLowerCase();
      if (/tablet|ipad/i.test(ua)) device_type = "Tablet";
      else if (/mobile|iphone|android.*mobile/i.test(ua)) device_type = "Mobile";
      else device_type = "Desktop";
    }

    const user_country =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      null;

    const referrer = body.referrer || body.referer || req.headers.get("referer") || "";
    let referrer_domain: string | null = null;
    if (referrer) {
      try { referrer_domain = new URL(referrer).hostname.replace(/^www\./, ""); } catch {}
    }

    // 5) Create lead
    const supabase = createServiceClient();
    const leadId = crypto.randomUUID();

    const { error: insErr } = await supabase.from("partner_leads").insert({
      id: leadId,
      source,
      full_name: full_name || "Unknown",
      phone: phone || null,
      email,
      age: null,
      image_paths: [],
      status: "new",
      device_type,
      user_country,
      referrer_domain,
    });

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // 6) Auto-assign to clinic
    const origin = req.nextUrl.origin || "https://medtravel.me";
    await autoAssignLead({ leadId, origin });

    // 7) Return success
    return NextResponse.json({ ok: true, id: leadId }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

// Also support GET for testing connectivity
export async function GET(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }
  return NextResponse.json({
    ok: true,
    message: "Webhook endpoint is active. Send POST requests with lead data.",
    expected_fields: ["full_name", "phone", "email (optional)", "source (optional)"],
  });
}