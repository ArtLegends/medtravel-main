import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isPartner(route: any, userId: string) {
  const { data } = await route.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("partner");
}

export async function GET(req: NextRequest) {
  const route = await createRouteClient();
  const { data: auth } = await route.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await isPartner(route, user.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const leadId = (url.searchParams.get("leadId") || "").trim();
  const path = (url.searchParams.get("path") || "").trim();

  if (!leadId) return NextResponse.json({ error: "Missing leadId" }, { status: 400 });
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  const admin = createServiceClient();

  // 1) проверяем принадлежность лида партнеру + что path внутри image_paths
  const { data: lead, error: lErr } = await admin
    .from("partner_leads")
    .select("id,assigned_partner_id,image_paths")
    .eq("id", leadId)
    .single();

  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (String(lead.assigned_partner_id ?? "") !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const paths: string[] = lead.image_paths ?? [];
  if (!paths.includes(path)) {
    return NextResponse.json({ error: "Path not in lead" }, { status: 403 });
  }

  // 2) скачиваем файл
  const { data, error } = await admin.storage.from("partner-leads").download(path);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const arr = await data.arrayBuffer();

  const ext = path.split(".").pop()?.toLowerCase();
  const contentType =
    ext === "png" ? "image/png" :
    ext === "webp" ? "image/webp" :
    "image/jpeg";

  return new NextResponse(arr, {
    headers: {
      "content-type": contentType,
      "cache-control": "private, max-age=300",
    },
  });
}