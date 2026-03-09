// supabase/functions/send-sms/index.ts
// Supabase Auth Send SMS Hook → Twilio integration
// Replaces the built-in Twilio phone provider with a custom hook

import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

// Twilio credentials from Edge Function secrets
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!;

interface SendSMSPayload {
  user: {
    id: string;
    phone: string;
    email?: string;
  };
  sms: {
    otp: string;
  };
}

Deno.serve(async (req) => {
  // ─── 1. Verify webhook signature (Standard Webhooks) ───
  const payload = await req.text();
  const base64Secret = Deno.env
    .get("SEND_SMS_HOOK_SECRET")!
    .replace("v1,whsec_", "");
  const headers = Object.fromEntries(req.headers);
  const wh = new Webhook(base64Secret);

  let data: SendSMSPayload;
  try {
    data = wh.verify(payload, headers) as SendSMSPayload;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response(
      JSON.stringify({
        error: {
          http_code: 401,
          message: `Webhook verification failed: ${err}`,
        },
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // ─── 2. Extract phone & OTP ───
  const phone = data.user.phone.startsWith("+") ? data.user.phone : `+${data.user.phone}`;
  const otp = data.sms.otp;
  const messageBody = `Your MedTravel verification code: ${otp}`;

  console.log(`Sending OTP to ${phone.slice(0, 5)}***`);

  // ─── 3. Send SMS via Twilio REST API ───
  // Docs: https://www.twilio.com/docs/messaging/api/message-resource#create-a-message-resource
  try {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    // Twilio uses Basic Auth: base64(AccountSID:AuthToken)
    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    // Twilio expects URL-encoded form data, not JSON
    const formBody = new URLSearchParams({
      To: phone,
      From: TWILIO_PHONE_NUMBER,
      Body: messageBody,
    });

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: formBody.toString(),
    });

    const result = await twilioRes.json();

    if (!twilioRes.ok) {
      console.error("Twilio error:", JSON.stringify(result));
      return new Response(
        JSON.stringify({
          error: {
            http_code: twilioRes.status,
            message: `Twilio error: ${result.message || JSON.stringify(result)}`,
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check Twilio message status
    if (result.status === "failed" || result.status === "undelivered") {
      console.error("Message failed:", result.error_message);
      return new Response(
        JSON.stringify({
          error: {
            http_code: 500,
            message: `SMS delivery failed: ${result.error_message || "unknown"}`,
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`SMS sent successfully. SID: ${result.sid}, Status: ${result.status}`);

    // ─── 4. Return success ───
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: `Failed to send SMS: ${error}`,
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});