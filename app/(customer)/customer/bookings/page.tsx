// app/(customer)/customer/bookings/page.tsx
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentClinicId } from "@/app/(customer)/customer/_utils/getCurrentClinicId";
import BookingsClient, { Row } from "./BookingsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BookingsPage() {
  const clinicId = await getCurrentClinicId();

  if (!clinicId) {
    return (
      <div className="p-6 text-rose-600">
        No clinic is linked to this account yet. Please contact MedTravel support.
      </div>
    );
  }

  const { data, error } = await supabaseServer
    .from("v_customer_clinic_requests" as any)
    .select(
      "id, clinic_id, name, phone, contact_method, service, status, created_at"
    )
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load bookings:", error);
  }

  const rows = (data ?? []) as unknown as Row[];

  return <BookingsClient clinicId={clinicId} initialRows={rows} />;
}
