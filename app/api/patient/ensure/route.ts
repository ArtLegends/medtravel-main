import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function splitName(full: string) {
  const s = String(full || "").trim().replace(/\s+/g, " ");
  if (!s) return { first_name: null as string | null, last_name: null as string | null };
  const parts = s.split(" ");
  const first = parts[0] ?? "";
  const last = parts.slice(1).join(" ").trim();
  return { first_name: first || null, last_name: last || null };
}

export async function POST(req: Request) {
  const route = await createRouteClient();
  const { data: au } = await route.auth.getUser();
  const user = au?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const fullName = String(body?.full_name ?? "").trim();
  const phone = String(body?.phone ?? "").trim();

  const sb = createServiceClient();

  const { first_name, last_name } = splitName(fullName);

  await sb.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      role: "patient",
      first_name,
      last_name,
      phone: phone || user.phone || null,
    } as any,
    { onConflict: "id" }
  );

  await sb
    .from("user_roles")
    .upsert({ user_id: user.id, role: "patient" } as any, { onConflict: "user_id,role" } as any);

  // optional: метадата (удобно для UI)
  await sb.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...(user.user_metadata ?? {}),
      requested_role: "PATIENT",
      first_name,
      last_name,
      phone: phone || user.phone || null,
      display_name: fullName || null,
    },
  });

  return NextResponse.json({ ok: true, patient_id: user.id });
}