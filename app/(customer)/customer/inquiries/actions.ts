// app/(customer)/customer/inquiries/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export async function customerUpdateClinicInquiryStatusAction(id: string, status: string) {
  const sb = supabaseServer;
  const { error } = await sb.rpc("customer_clinic_inquiry_update_status", { p_id: id, p_status: status });
  if (error) throw new Error(error.message);
  revalidatePath("/customer/inquiries");
}

export async function customerDeleteClinicInquiryAction(id: string) {
  const sb = supabaseServer;
  const { error } = await sb.rpc("customer_clinic_inquiry_delete", { p_id: id });
  if (error) throw new Error(error.message);
  revalidatePath("/customer/inquiries");
}

export async function customerDeleteAllClinicInquiriesAction(params?: { start?: string; end?: string; status?: string }) {
  const sb = supabaseServer;

  const p_start = params?.start ? params.start : undefined;
  const p_end = params?.end ? params.end : undefined;
  const p_status = params?.status && params.status !== "all" ? params.status : "all";

  const { error } = await sb.rpc("customer_clinic_inquiries_delete_all", {
    p_status,
    p_start,
    p_end,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/customer/inquiries");
}
