import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { resendSend, patientMagicLinkTemplate } from "@/lib/mail/resend";
import crypto from "crypto";

export const runtime = "nodejs";

function safeEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function splitName(full: string) {
  const s = String(full || "").trim().replace(/\s+/g, " ");
  if (!s) return { first_name: null as string | null, last_name: null as string | null };
  const parts = s.split(" ");
  const first = parts[0] ?? "";
  const last = parts.slice(1).join(" ").trim();
  return { first_name: first || null, last_name: last || null };
}

async function ensurePatientAndSendMagicLink(params: {
  supabase: ReturnType<typeof createServiceClient>;
  origin: string;
  email: string;
  full_name: string;
  phone: string;
}) {
  const { supabase, origin, email, full_name, phone } = params;

  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (profErr) throw new Error(profErr.message);

  let userId: string | null = prof?.id ?? null;
  let created = false;

  if (!userId) {
    const { data: createdUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: { requested_role: "PATIENT" },
    });

    if (createErr) {
      const msg = String(createErr.message || "");
      if (!msg.toLowerCase().includes("already")) throw new Error(msg);

      const { data: prof2, error: prof2Err } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (prof2Err) throw new Error(prof2Err.message);
      userId = prof2?.id ?? null;
      if (!userId) throw new Error("User exists but profile not found");
    } else {
      userId = createdUser?.user?.id ?? null;
      created = true;
    }
  }

  if (!userId) throw new Error("Failed to resolve user id");

  const { first_name, last_name } = splitName(full_name);

  await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      role: "patient",
      first_name,
      last_name,
      phone: phone || null,
    } as any,
    { onConflict: "id" },
  );

  await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role: "patient" } as any, { onConflict: "user_id,role" } as any);

  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      first_name,
      last_name,
      phone: phone || null,
      display_name: full_name || null,
      requested_role: "PATIENT",
    },
  });

  const settingsUrl = `${origin}/settings`;

  await supabase.from("notifications").insert({
    user_id: userId,
    type: "set_password",
    data: {
      title: "Secure your account",
      message: "Set a password to sign in faster next time.",
      action_url: settingsUrl,
    },
    is_read: false,
  });

  const redirectTo = `${origin}/auth/magic?as=PATIENT&next=${encodeURIComponent("/patient")}`;

  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (linkErr) throw new Error(linkErr.message);

  const actionLink =
    (linkData as any)?.properties?.action_link ||
    (linkData as any)?.action_link ||
    null;

  if (!actionLink) throw new Error("Failed to generate magic link");

  const tpl = patientMagicLinkTemplate(actionLink);
  await resendSend({ to: email, subject: tpl.subject, html: tpl.html });

  return { userId, created };
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();

  try {
    const fd = await req.formData();

    const source = String(fd.get("source") ?? "unknown").slice(0, 80);
    const full_name = String(fd.get("full_name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const ageRaw = String(fd.get("age") ?? "").trim();

    const emailRaw = String(fd.get("email") ?? "").trim().toLowerCase();
    const email = emailRaw || null;

    if (!full_name) return NextResponse.json({ error: "Введите ФИО" }, { status: 400 });
    if (!phone) return NextResponse.json({ error: "Введите телефон" }, { status: 400 });

    if (email && !safeEmail(email)) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
    }

    const ageNum = ageRaw ? Number(ageRaw) : null;
    const age = Number.isFinite(ageNum as any) ? (ageNum as number) : null;

    const images = fd.getAll("images").filter(Boolean) as File[];
    const image_paths: string[] = [];

    const leadId = crypto.randomUUID();

    for (const file of images.slice(0, 3)) {
      if (!(file instanceof File)) continue;
      if (!file.type.startsWith("image/")) continue;

      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 10);
      const path = `${leadId}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("partner-leads")
        .upload(path, file, { contentType: file.type, upsert: false, cacheControl: "3600" });

      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

      image_paths.push(path);
    }

    const { error: insErr } = await supabase.from("partner_leads").insert({
      id: leadId,
      source,
      full_name,
      phone,
      email, // ✅ теперь допустим null (после миграции)
      age,
      image_paths,
      status: "new",
    });

    if (insErr) {
      if (image_paths.length) await supabase.storage.from("partner-leads").remove(image_paths);
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    const origin = req.nextUrl.origin;

    // ✅ создаём пациента и шлём письмо ТОЛЬКО если есть email
    if (email) {
      const patient = await ensurePatientAndSendMagicLink({
        supabase,
        origin,
        email,
        full_name,
        phone,
      });

      return NextResponse.json({
        ok: true,
        id: leadId,
        patient: { userId: patient.userId, created: patient.created, emailSent: true },
      });
    }

    return NextResponse.json({
      ok: true,
      id: leadId,
      patient: { emailSent: false },
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}