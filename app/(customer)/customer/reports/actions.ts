"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentClinicId } from "@/app/(customer)/customer/_utils/getCurrentClinicId";

export async function updateReportStatusAction(id: string, status: "New"|"Processed"|"Rejected") {
  const clinicId = await getCurrentClinicId();
  if (!clinicId) throw new Error("No clinic cookie set");

  const { error } = await supabaseServer
    .from("reports" as any)
    .update({ status } as any)
    .eq("id", id)
    .eq("clinic_id", clinicId);

  if (error) throw new Error(error.message);
  revalidatePath("/customer/reports");
}

export async function deleteReportAction(id: string) {
  const clinicId = await getCurrentClinicId();
  if (!clinicId) throw new Error("No clinic cookie set");

  const { error } = await supabaseServer
    .from("reports" as any)
    .delete()
    .eq("id", id)
    .eq("clinic_id", clinicId);

  if (error) throw new Error(error.message);
  revalidatePath("/customer/reports");
}

export async function deleteAllReportsAction() {
  const clinicId = await getCurrentClinicId();
  if (!clinicId) throw new Error("No clinic cookie set");

  const { error } = await supabaseServer
    .from("reports" as any)
    .delete()
    .eq("clinic_id", clinicId);

  if (error) throw new Error(error.message);
  revalidatePath("/customer/reports");
}
