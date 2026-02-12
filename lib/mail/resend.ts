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