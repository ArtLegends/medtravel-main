import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("admin");
}

export async function GET(req: NextRequest) {
  const supabase = await createRouteClient();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await isAdmin(supabase, user.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const id = (url.searchParams.get("id") || "").trim();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data, error } = await supabase
    .from("partner_leads")
    .select("image_paths")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const paths: string[] = data?.image_paths ?? [];
  if (!paths.length) return NextResponse.json({ urls: [] });

  const urls: string[] = [];
  for (const p of paths.slice(0, 3)) {
    const { data: signed, error: sErr } = await supabase.storage
      .from("partner-leads")
      .createSignedUrl(p, 60 * 5); // 5 минут

    if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });
    if (signed?.signedUrl) urls.push(signed.signedUrl);
  }

  return NextResponse.json({ urls });
}