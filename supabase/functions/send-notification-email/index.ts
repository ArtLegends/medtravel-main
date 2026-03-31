// supabase/functions/send-notification-email/index.ts
// Deployed as Supabase Edge Function
// Called automatically by DB trigger on INSERT into notifications table

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("RESEND_FROM") ?? Deno.env.get("EMAIL_FROM") ?? "MedTravel <notifications@medtravel.me>";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://medtravel.me";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ─── Security: only accept calls from pg_trigger or with service role ───
function isAuthorized(req: Request): boolean {
  const source = req.headers.get("x-internal-source");
  if (source === "pg_trigger") return true;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) return true;
  return false;
}

// ─── Email templates per notification type ───
interface TemplateResult {
  subject: string;
  html: string;
}

function renderTemplate(type: string, data: Record<string, any>, userName: string): TemplateResult | null {
  const name = userName || "there";

  const wrap = (title: string, body: string, cta?: { label: string; href: string }) => {
    const ctaHtml = cta
      ? `<a href="${cta.href}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#10b981;color:white;text-decoration:none;border-radius:10px;font-weight:600">${cta.label}</a>`
      : "";
    return `<div style="font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;max-width:520px;margin:0 auto;padding:24px">
      <div style="margin-bottom:20px"><img src="${SITE_URL}/logo.png" alt="MedTravel" width="140" style="display:block" /></div>
      <h2 style="margin:0 0 12px;font-size:18px;color:#111">${title}</h2>
      <div style="margin:0 0 12px;color:#374151;font-size:14px">${body}</div>
      ${ctaHtml}
      <hr style="margin:24px 0 12px;border:none;border-top:1px solid #e5e7eb" />
      <p style="margin:0;font-size:11px;color:#9ca3af">You received this email because you have an account on MedTravel. <a href="${SITE_URL}/profile" style="color:#6b7280">Manage email preferences</a></p>
    </div>`;
  };

  switch (type) {
    // ── Patient booking notifications ──
    case "booking_confirmed":
      return {
        subject: `Booking confirmed — ${data.clinic_name || "your appointment"}`,
        html: wrap(
          "Your booking is confirmed ✅",
          `<p>Hi ${name}, your booking for <strong>${data.service_name || "your appointment"}</strong> at <strong>${data.clinic_name || "the clinic"}</strong> has been confirmed.</p>${data.scheduled_at ? `<p>📅 <strong>Scheduled for:</strong> ${data.scheduled_at}</p>` : ""}`,
          { label: "View my bookings", href: `${SITE_URL}/patient/bookings` }
        ),
      };

    case "booking_completed":
      return {
        subject: `Treatment completed — ${data.clinic_name || "your visit"}`,
        html: wrap(
          "Your treatment is complete ✅",
          `<p>Hi ${name}, your treatment at <strong>${data.clinic_name || "the clinic"}</strong> has been successfully completed. We hope everything went well!</p><p>If you'd like, you can leave a review to help other patients.</p>`,
          { label: "View my bookings", href: `${SITE_URL}/patient/bookings` }
        ),
      };

    case "booking_canceled":
      return {
        subject: `Booking canceled — ${data.clinic_name || "your appointment"}`,
        html: wrap(
          "Your booking has been canceled",
          `<p>Hi ${name}, your booking at <strong>${data.clinic_name || "the clinic"}</strong> has been canceled.</p><p>If you have any questions, please contact the clinic directly.</p>`,
          { label: "View my bookings", href: `${SITE_URL}/patient/bookings` }
        ),
      };

    // ── Clinic owner notifications ──
    case "new_booking":
      return {
        subject: `New booking request from ${data.patient_name || "a patient"}`,
        html: wrap(
          "New booking request 📋",
          `<p>Hi ${name}, <strong>${data.patient_name || "A new patient"}</strong> has submitted a booking request for <strong>${data.service_name || "a service"}</strong>.</p><p>Please review it in your clinic dashboard.</p>`,
          { label: "Review in dashboard", href: `${SITE_URL}/customer` }
        ),
      };

    case "new_review":
      return {
        subject: `New review (${data.rating || "—"}/10) for ${data.clinic_name || "your clinic"}`,
        html: wrap(
          "New review received ⭐",
          `<p>Hi ${name}, <strong>${data.reviewer_name || "A patient"}</strong> has left a new review rated <strong>${data.rating || "—"}/10</strong> for <strong>${data.clinic_name || "your clinic"}</strong>.</p>`,
          { label: "View reviews", href: `${SITE_URL}/customer` }
        ),
      };

    case "new_inquiry":
      return {
        subject: `New inquiry about ${data.clinic_name || "your clinic"}`,
        html: wrap(
          "New inquiry received 💬",
          `<p>Hi ${name}, <strong>${data.sender_name || "A potential patient"}</strong> has sent a new inquiry about <strong>${data.clinic_name || "your clinic"}</strong>.</p><p>Please respond as soon as possible.</p>`,
          { label: "View inquiries", href: `${SITE_URL}/customer` }
        ),
      };

    // ── Clinic status ──
    case "clinic_approved":
      return {
        subject: "Your clinic has been approved on MedTravel! 🎉",
        html: wrap(
          "Congratulations! Your clinic is live ✅",
          `<p>Hi ${name}, your clinic <strong>${data.name || "your clinic"}</strong> has been approved and is now published on MedTravel.</p><p>Patients can now find and book appointments at your clinic.</p>`,
          data.slug ? { label: "View clinic page", href: `${SITE_URL}/clinic/${data.slug}` } : { label: "Go to dashboard", href: `${SITE_URL}/customer` }
        ),
      };

    case "clinic_rejected":
      return {
        subject: "Clinic application update — MedTravel",
        html: wrap(
          "Clinic application not approved",
          `<p>Hi ${name}, unfortunately your clinic <strong>${data.name || "your clinic"}</strong> application was not approved at this time.</p><p>Please contact our support team for further details and guidance on resubmitting.</p>`,
          { label: "Contact support", href: `${SITE_URL}/contact` }
        ),
      };

    // ── Partner / affiliate ──
    case "partner_program_approved": {
      const program = data.program_key || "affiliate";
      let extra = "";
      if (data.ref_code) extra += `<p><strong>Your referral code:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;font-family:monospace">${data.ref_code}</code></p>`;
      if (data.referral_url) extra += `<p><strong>Your referral link:</strong> <a href="${data.referral_url}" style="color:#10b981">${data.referral_url}</a></p>`;
      return {
        subject: `${program} affiliate program approved — MedTravel`,
        html: wrap(
          "Affiliate program approved ✅",
          `<p>Hi ${name}, your request for the <strong>${program}</strong> affiliate program has been approved.</p>${extra}<p>Start sharing your link and earn commissions!</p>`,
          { label: "Go to partner dashboard", href: `${SITE_URL}/partner` }
        ),
      };
    }

    case "new_referral":
      return {
        subject: "New patient referral — MedTravel",
        html: wrap(
          "New patient referral 🎉",
          `<p>Hi ${name}, great news! A new patient has registered through your <strong>${data.program_key || "referral"}</strong> program.</p><p>Keep sharing your link to earn more commissions.</p>`,
          { label: "View referrals", href: `${SITE_URL}/partner` }
        ),
      };

    case "new_partner_recruited":
      return {
        subject: "New affiliate partner joined your network — MedTravel",
        html: wrap(
          "New affiliate partner recruited 🤝",
          `<p>Hi ${name}, a new affiliate partner has joined your network through your recruitment link.</p><p>You will earn commissions from their future referrals.</p>`,
          { label: "View partners", href: `${SITE_URL}/supervisor/partners` }
        ),
      };

    // ── Account ──
    case "set_password":
      return {
        subject: "Set a password for your MedTravel account",
        html: wrap(
          "Set your account password",
          `<p>Hi ${name}, you signed in via email link. Set a password to enable faster sign-in next time.</p>`,
          { label: "Go to Settings", href: data.action_url || `${SITE_URL}/settings` }
        ),
      };

    default:
      if (data.message) {
        return {
          subject: "Notification from MedTravel",
          html: wrap("Notification", `<p>Hi ${name}, ${data.message}</p>`),
        };
      }
      return null;
  }
}

// ─── Main handler ───
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" } });
  }

  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const payload = await req.json();
    const { notification_id, user_id, type, data: notifData } = payload;

    if (!user_id || !type || !notification_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // 1. Check if user has email_notifications enabled
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, first_name, email_notifications")
      .eq("id", user_id)
      .single();

    if (!profile || profile.email_notifications === false) {
      await supabase.from("notifications").update({ email_sent: false }).eq("id", notification_id);
      return new Response(JSON.stringify({ skipped: true, reason: "email_notifications disabled" }), { status: 200 });
    }

    // 2. Get user email: profiles.email → auth.users.email → user_metadata.secondary_email
    let email = profile.email;
    if (!email) {
      const { data: authUser } = await supabase.auth.admin.getUserById(user_id);
      email = authUser?.user?.email ?? null;
    }

    if (!email) {
      console.log(`No email found for user ${user_id}, skipping`);
      return new Response(JSON.stringify({ skipped: true, reason: "no email" }), { status: 200 });
    }

    const userName = profile.first_name || "";

    // 3. Render email template
    const template = renderTemplate(type, notifData || {}, userName);
    if (!template) {
      console.log(`No template for type: ${type}`);
      return new Response(JSON.stringify({ skipped: true, reason: "no template" }), { status: 200 });
    }

    // 4. Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: template.subject,
        html: template.html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text().catch(() => "");
      console.error(`Resend error: ${resendRes.status} ${errText}`);
      return new Response(JSON.stringify({ error: "Resend failed", detail: errText }), { status: 502 });
    }

    // 5. Mark email_sent = true
    await supabase.from("notifications").update({ email_sent: true }).eq("id", notification_id);

    console.log(`Email sent for notification ${notification_id} (type=${type}) to ${email}`);
    return new Response(JSON.stringify({ success: true, email, type }), { status: 200 });

  } catch (err) {
    console.error("send-notification-email error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});