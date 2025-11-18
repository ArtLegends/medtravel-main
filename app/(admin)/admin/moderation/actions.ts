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

  // 1) основная логика в БД (services, staff, images, hours, accreditations, category + статусы)
  const { error: rpcError } = await supabase.rpc("publish_clinic_from_draft", {
    p_clinic_id: clinicId,
  });

  if (rpcError) {
    console.error("publish_clinic_from_draft error:", rpcError);
    throw rpcError;
  }

  // 2) забираем из драфта pricing -> собираем payments JSON для clinics
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
    const pricingArray: unknown[] = draft.pricing as unknown[];

    const methods = pricingArray
      .map((item: unknown): string | null => {
        if (typeof item === "string") return item;
        const obj = item as { method?: unknown; name?: unknown } | null;
        if (obj && typeof obj.method === "string") return obj.method;
        if (obj && typeof obj.name === "string") return obj.name;
        return null;
      })
      .filter(
        (v: unknown): v is string =>
          typeof v === "string" && v.trim().length > 0
      );

    const uniqMethods = Array.from(new Set(methods));
    payments =
      uniqMethods.length > 0
        ? uniqMethods.map((method) => ({ method }))
        : null;
  }

  // Обновляем строку в clinics: статусы + payments (если есть)
  const updatePayload: Record<string, unknown> = {
    is_published: true,
    moderation_status: "approved",
    status: "published",
  };

  // если payments вычислены — явно пишем их (можно и null)
  if (payments !== null) {
    updatePayload.payments = payments;
  }

  const { error: clinicsUpdateError } = await supabase
    .from("clinics")
    .update(updatePayload)
    .eq("id", clinicId);

  if (clinicsUpdateError) {
    console.error("clinics status/payments update error:", clinicsUpdateError);
    throw clinicsUpdateError;
  }

  // 3) помечаем драфт как published (если таблица/колонка существуют)
  try {
    await supabase
      .from("clinic_profile_drafts")
      .update({ status: "published" })
      .eq("clinic_id", clinicId);
  } catch (e) {
    console.warn("clinic_profile_drafts publish update warning:", e);
  }

  // 4) перерисовать очередь модерации
  revalidatePath("/admin/moderation");
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
