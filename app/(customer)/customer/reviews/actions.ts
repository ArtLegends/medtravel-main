"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentClinicId } from "@/app/(customer)/customer/_utils/getCurrentClinicId";

export async function updateReviewStatusAction(id: string, status: string) {
  const clinicId = await getCurrentClinicId();
  if (!clinicId) throw new Error("No clinic cookie set");

  const { error } = await supabaseServer
    .from("reviews" as any)
    .update({ status } as any)
    .eq("id", id)
    .eq("clinic_id", clinicId);

  if (error) throw new Error(error.message);
  revalidatePath("/customer/reviews");
}

export async function deleteReviewAction(id: string) {
  const clinicId = await getCurrentClinicId();
  if (!clinicId) throw new Error("No clinic cookie set");

  const { error } = await supabaseServer
    .from("reviews" as any)
    .delete()
    .eq("id", id)
    .eq("clinic_id", clinicId);

  if (error) throw new Error(error.message);
  revalidatePath("/customer/reviews");
}

export async function deleteAllReviewsAction() {
  const clinicId = await getCurrentClinicId();
  if (!clinicId) throw new Error("No clinic cookie set");

  const { error } = await supabaseServer
    .from("reviews" as any)
    .delete()
    .eq("clinic_id", clinicId);

  if (error) throw new Error(error.message);
  revalidatePath("/customer/reviews");
}
