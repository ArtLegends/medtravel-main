// app/(customer)/customer/bookings/page.tsx
import { Calendar, RefreshCw, Database, Download, Trash2 } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentClinicId } from "@/app/(customer)/customer/_utils/getCurrentClinicId";
import {
  updateCustomerRequestStatusAction,
  deleteCustomerRequestAction,
  deleteAllCustomerRequestsAction,
} from "./actions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Row = {
  id: string;
  clinic_id: string | null;
  name: string | null;
  phone: string | null;
  contact_method: string | null;
  service: string | null;
  status: string | null;
  created_at: string | null;
};

function OutlineBtn({ children, className = "", type = "button" }:{
  children: React.ReactNode; className?: string; type?: "button"|"submit"
}) {
  return (
    <button type={type}
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50 ${className}`}>
      {children}
    </button>
  );
}

export default async function BookingsPage() {
  // читаем clinic_id из cookie (временно вместо auth)
  const clinicId = await getCurrentClinicId();
  if (!clinicId) {
    return <div className="p-6 text-rose-600">No clinic is linked to this account yet. Please contact MedTravel support.</div>;
  }

  // выборка из вьюхи
  const { data, error } = await supabaseServer
    .from("v_customer_clinic_requests" as any)
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as Row[];
  const total = rows.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-gray-500">Manage booking requests for your clinic</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/customer/bookings" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </a>

          <button className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50" title="Temporary stub">
            <Database className="h-4 w-4" />
            Test DB
          </button>

          <a href="/customer/bookings?export=csv" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export CSV
          </a>

          <form action={deleteAllCustomerRequestsAction}>
            <button className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-600">
              <Trash2 className="h-4 w-4" />
              Delete All
            </button>
          </form>
        </div>
      </div>

      {/* Filters card — UI пока статический */}
      <div className="rounded-xl border bg-white p-4">
        {/* Dates row */}
        <div className="mb-4 flex flex-wrap gap-2">
          <OutlineBtn>
            <Calendar className="h-4 w-4" />
            Pick a date
          </OutlineBtn>
          <OutlineBtn>
            <Calendar className="h-4 w-4" />
            Pick a date
          </OutlineBtn>
          <OutlineBtn>Clear Dates</OutlineBtn>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Search</label>
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">All Statuses</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Statuses</option>
              <option>New</option>
              <option>In review</option>
              <option>Contacted</option>
              <option>Scheduled</option>
              <option>Done</option>
              <option>Rejected</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">All Services</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Services</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">All Methods</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Methods</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <OutlineBtn>Reset Filters</OutlineBtn>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border">
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-500">
          <div>Total: {total}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Contact Method</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.name ?? "—"}</td>
                  <td className="px-4 py-3">{r.phone ?? "—"}</td>
                  <td className="px-4 py-3">{r.contact_method ?? "—"}</td>
                  <td className="px-4 py-3">{r.service ?? "—"}</td>
                  <td className="px-4 py-3">
                    <form action={async (formData) => {
                      "use server";
                      const val = formData.get("status")?.toString() ?? "New";
                      await updateCustomerRequestStatusAction(r.id, val);
                    }}>
                      <div className="flex items-center gap-2">
                        <select name="status" defaultValue={r.status ?? "New"} className="rounded border px-2 py-1">
                          {["New", "In review", "Contacted", "Scheduled", "Done", "Rejected"].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button type="submit" className="rounded border px-2 py-1">Save</button>
                      </div>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={async () => {
                      "use server";
                      await deleteCustomerRequestAction(r.id);
                    }}>
                      <button className="rounded-md bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={7}>
                    No booking records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom destructive button */}
      <form action={deleteAllCustomerRequestsAction}>
        <button className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-600">
          <Trash2 className="h-4 w-4" />
          Delete All
        </button>
      </form>
    </div>
  );
}
