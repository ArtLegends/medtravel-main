import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("admin");
}

export async function GET(req: NextRequest) {
  // 1) auth как админ — через route client (cookies)
  const route = await createRouteClient();
  const { data: auth } = await route.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await isAdmin(route, user.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // 2) путь к файлу
  const url = new URL(req.url);
  const path = (url.searchParams.get("path") || "").trim();
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  // 3) скачиваем сервисным ключом
  const admin = createServiceClient();
  const { data, error } = await admin.storage.from("partner-leads").download(path);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const arr = await data.arrayBuffer();

  // контент-тайп можно определить грубо по расширению
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