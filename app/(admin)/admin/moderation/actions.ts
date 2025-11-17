// app/(admin)/admin/moderation/actions.ts
"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** approve черновика → публикуем клинику (RPC: approve_clinic) */
export async function approveClinicAction(draftId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
        setAll: () => {},
      },
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "UNAUTHENTICATED" };

    const { data, error } = await supabase.rpc("approve_clinic", { p_draft_id: draftId });
    if (error) {
      console.error("approve_clinic RPC error:", error);
      return { ok: false, error: error.message || "RPC_ERROR" };
    }
    return { ok: true, clinicId: data as string };
  } catch (e: any) {
    console.error("approveClinicAction failed:", e);
    return { ok: false, error: e?.message || "UNKNOWN" };
  }
}

/** reject черновика (RPC: reject_clinic_draft) */
export async function rejectClinicAction(draftId: string, reason: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
        setAll: () => {},
      },
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "UNAUTHENTICATED" };

    const { error } = await supabase.rpc("reject_clinic_draft", {
      p_draft_id: draftId,
      p_reason: reason ?? "",
    });
    if (error) {
      console.error("reject_clinic_draft RPC error:", error);
      return { ok: false, error: error.message || "RPC_ERROR" };
    }
    return { ok: true };
  } catch (e: any) {
    console.error("rejectClinicAction failed:", e);
    return { ok: false, error: e?.message || "UNKNOWN" };
  }
}
