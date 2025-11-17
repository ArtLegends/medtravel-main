"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentClinicId } from "@/app/(customer)/customer/_utils/getCurrentClinicId";

export async function updateCustomerRequestStatusAction(id: string, status: string) {
  const clinicId = await getCurrentClinicId();
  if (!clinicId) throw new Error("No clinic cookie set");

  const { error } = await supabaseServer
    .from("clinic_requests" as any)
    .update({ status } as any)
    .eq("id", id)
    .eq("clinic_id", clinicId);

  if (error) throw new Error(error.message);
  revalidatePath("/customer/bookings");
}

export async function deleteCustomerRequestAction(id: string) {
  const clinicId = await getCurrentClinicId();
  if (!clinicId) throw new Error("No clinic cookie set");

  const { error } = await supabaseServer
    .from("clinic_requests" as any)
    .delete()
    .eq("id", id)
    .eq("clinic_id", clinicId);

  if (error) throw new Error(error.message);
  revalidatePath("/customer/bookings");
}

export async function deleteAllCustomerRequestsAction() {
  const clinicId = await getCurrentClinicId();
  if (!clinicId) throw new Error("No clinic cookie set");

  const { error } = await supabaseServer
    .from("clinic_requests" as any)
    .delete()
    .eq("clinic_id", clinicId);

  if (error) throw new Error(error.message);
  revalidatePath("/customer/bookings");
}
