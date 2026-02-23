export async function resendSend(params: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? process.env.EMAIL_FROM;

  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  if (!from) throw new Error("Missing RESEND_FROM (or EMAIL_FROM)");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Resend: failed to send email");
  }
}

export function customerApprovedTemplate(loginUrl: string) {
  return {
    subject: "Your MedTravel Clinic account is approved",
    html: `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.5">
        <h2 style="margin:0 0 12px">Approved ✅</h2>
        <p style="margin:0 0 12px">Your request to access the Clinic (Customer) panel has been approved.</p>
        <p style="margin:0 0 12px">You can now sign in using the email and password you set during registration.</p>
        <a href="${loginUrl}"
           style="display:inline-block;margin-top:10px;padding:10px 14px;background:#10b981;color:white;text-decoration:none;border-radius:10px;font-weight:600">
          Sign in to Clinic panel
        </a>
      </div>
    `,
  };
}

export function customerRejectedTemplate() {
  return {
    subject: "Your MedTravel Clinic request was rejected",
    html: `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.5">
        <h2 style="margin:0 0 12px">Request rejected</h2>
        <p style="margin:0 0 12px">Unfortunately, your request to access the Clinic (Customer) panel was rejected.</p>
        <p style="margin:0;color:#71717a">If you think this is a mistake, please contact support.</p>
      </div>
    `,
  };
}

export function patientMagicLinkTemplate(loginUrl: string) {
  return {
    subject: "Your MedTravel Patient account is ready",
    html: `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.5">
        <h2 style="margin:0 0 12px">Your patient account is ready ✅</h2>
        <p style="margin:0 0 12px">
          We created your MedTravel Patient account and linked it to this email.
        </p>
        <p style="margin:0 0 12px">
          Click the button below to sign in to your Patient dashboard:
        </p>

        <a href="${loginUrl}"
           style="display:inline-block;margin-top:10px;padding:10px 14px;background:#10b981;color:white;text-decoration:none;border-radius:10px;font-weight:600">
          Sign in to Patient dashboard
        </a>

        <p style="margin:16px 0 0;color:#71717a;font-size:12px">
          After signing in, we recommend setting a password in Settings for faster access next time.
        </p>
      </div>
    `,
  };
}

export function partnerNewLeadTemplate(params: {
  partnerName?: string | null;
  leadsUrl: string;
  lead: {
    full_name?: string | null;
    phone?: string | null;
    email?: string | null;
    source?: string | null;
    created_at?: string | null;
  };
}) {
  const partnerName = params.partnerName?.trim() || "Partner";
  const leadName = params.lead.full_name?.trim() || "New lead";

  return {
    subject: `New lead assigned — MedTravel`,
    html: `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.5">
        <h2 style="margin:0 0 12px">New lead assigned ✅</h2>
        <p style="margin:0 0 12px">Hi ${partnerName}, a new lead has been assigned to you.</p>

        <div style="margin:12px 0;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa">
          <div style="font-weight:600;margin:0 0 6px">${leadName}</div>
          ${params.lead.phone ? `<div style="margin:0 0 4px;color:#374151"><b>Phone:</b> ${params.lead.phone}</div>` : ""}
          ${params.lead.email ? `<div style="margin:0 0 4px;color:#374151"><b>Email:</b> ${params.lead.email}</div>` : ""}
          ${params.lead.source ? `<div style="margin:0 0 4px;color:#6b7280;font-size:12px"><b>Source:</b> ${params.lead.source}</div>` : ""}
          ${params.lead.created_at ? `<div style="margin:0;color:#6b7280;font-size:12px"><b>Created:</b> ${params.lead.created_at}</div>` : ""}
        </div>

        <a href="${params.leadsUrl}"
           style="display:inline-block;margin-top:10px;padding:10px 14px;background:#10b981;color:white;text-decoration:none;border-radius:10px;font-weight:600">
          Open Partner leads
        </a>

        <p style="margin:16px 0 0;color:#71717a;font-size:12px">
          If you didn’t expect this email, just ignore it.
        </p>
      </div>
    `,
  };
}

export function partnerApprovedTemplate(loginUrl: string) {
  return {
    subject: "Your MedTravel Partner account is approved",
    html: `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.5">
        <h2 style="margin:0 0 12px">Approved ✅</h2>
        <p style="margin:0 0 12px">Your request to access the Partner panel has been approved.</p>
        <p style="margin:0 0 12px">You can now sign in using the email and password you set during registration.</p>
        <a href="${loginUrl}"
           style="display:inline-block;margin-top:10px;padding:10px 14px;background:#10b981;color:white;text-decoration:none;border-radius:10px;font-weight:600">
          Sign in to Partner panel
        </a>
      </div>
    `,
  };
}

export function partnerRejectedTemplate() {
  return {
    subject: "Your MedTravel Partner request was rejected",
    html: `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.5">
        <h2 style="margin:0 0 12px">Request rejected</h2>
        <p style="margin:0 0 12px">Unfortunately, your request to access the Partner panel was rejected.</p>
        <p style="margin:0;color:#71717a">If you think this is a mistake, please contact support.</p>
      </div>
    `,
  };
}