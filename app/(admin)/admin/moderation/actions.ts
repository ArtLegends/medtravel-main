// app/(admin)/admin/moderation/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/adminClient";

/**
 * APPROVE:
 * 1) вызываем RPC publish_clinic_from_draft(p_clinic_id uuid),
 *    чтобы синхронизировать все зависимые таблицы (services, staff, images, hours и т.д.)
 * 2) дополнительно дочитываем pricing из драфта и собираем payments для clinics
 * 3) помечаем драфт как published
 */
export async function approveClinic(formData: FormData) {
  const clinicId = String(formData.get("clinicId") ?? "");
  if (!clinicId) return;

  const supabase = createAdminClient();

  // 1) на всякий случай ещё раз синкнем связи (если уже синкалось — должно быть безопасно)
  const { error: syncErr } = await supabase.rpc("sync_clinic_relations_from_draft", {
    p_clinic_id: clinicId,
  });
  if (syncErr) {
    console.error("sync_clinic_relations_from_draft error:", syncErr);
    throw syncErr;
  }

  // 2) pricing -> payments (как у тебя)
  const { data: draft, error: draftError } = await supabase
    .from("clinic_profile_drafts")
    .select("pricing")
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (draftError) {
    console.error("Load draft pricing error:", draftError);
  }

  let payments: { method: string }[] | null = null;

  if (draft && Array.isArray(draft.pricing)) {
    const methods = (draft.pricing as unknown[])
      .map((item) => {
        if (typeof item === "string") return item;
        const obj = item as { method?: unknown; name?: unknown } | null;
        if (obj && typeof obj.method === "string") return obj.method;
        if (obj && typeof obj.name === "string") return obj.name;
        return null;
      })
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0);

    const uniq = Array.from(new Set(methods.map((m) => m.trim())));
    payments = uniq.length ? uniq.map((method) => ({ method })) : null;
  }

  // 3) финальные статусы клиники
  const updatePayload: Record<string, unknown> = {
    is_published: true,
    moderation_status: "approved",
    status: "published",
  };
  if (payments !== null) updatePayload.payments = payments;

  const { error: clinicsUpdateError } = await supabase
    .from("clinics")
    .update(updatePayload)
    .eq("id", clinicId);

  if (clinicsUpdateError) {
    console.error("clinics update error:", clinicsUpdateError);
    throw clinicsUpdateError;
  }

  // 4) уведомление владельцу
  try {
    const { data: clinicRow } = await supabase
      .from("clinics")
      .select("id, owner_id, name, slug, country, province, city, district")
      .eq("id", clinicId)
      .maybeSingle();

    if (clinicRow?.owner_id) {
      await supabase.from("notifications").insert({
        user_id: clinicRow.owner_id,
        type: "clinic_approved",
        is_read: false,
        data: {
          clinic_id: clinicRow.id,
          name: clinicRow.name,
          slug: clinicRow.slug,
          country: clinicRow.country,
          province: clinicRow.province,
          city: clinicRow.city,
          district: clinicRow.district,
        },
      });
    }
  } catch (e) {
    console.warn("clinic_approved notification insert error:", e);
  }

  // 5) драфт -> published
  await supabase
    .from("clinic_profile_drafts")
    .update({ status: "published" })
    .eq("clinic_id", clinicId);

  revalidatePath("/admin/moderation");
  revalidatePath(`/admin/moderation/detail?id=${clinicId}`);
}

/**
 * REJECT:
 * - напрямую обновляем статус клиники и драфта через сервис-клиент
 */
export async function rejectClinic(formData: FormData) {
  const clinicId = String(formData.get("clinicId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  if (!clinicId) return;

  const supabase = createAdminClient();

  // 1) обновляем клинику
  const { error: clinicsError } = await supabase
    .from("clinics")
    .update({
      is_published: false,
      moderation_status: "rejected",
      status: "draft",
      // reason сейчас нигде не сохраняем (нет колонки)
    })
    .eq("id", clinicId);

  if (clinicsError) {
    console.error("clinics reject update error:", clinicsError);
    throw clinicsError;
  }

  // 2) возвращаем драфт в статус draft
  try {
    await supabase
      .from("clinic_profile_drafts")
      .update({
        status: "draft",
        // сюда потом можно добавить колонку для причины
      })
      .eq("clinic_id", clinicId);
  } catch (e) {
    console.warn("clinic_profile_drafts reject update warning:", e);
  }

  revalidatePath("/admin/moderation");
}
