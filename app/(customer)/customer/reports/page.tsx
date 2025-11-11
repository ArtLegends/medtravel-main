// серверный рендер, без onClick
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentClinicId } from "@/app/(customer)/customer/_utils/getCurrentClinicId";
import {
  updateReportStatusAction,
  deleteReportAction,
  deleteAllReportsAction,
} from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ReportRow = {
  id: string;
  clinic_id: string;
  created_at: string;
  reporter: string | null;
  contact: string | null;
  relationship: string | null;
  details: string | null;
  status: "New" | "Processed" | "Rejected" | "new" | "processed" | "rejected";
};

const STATUS_OPTIONS = ["New","Processed","Rejected"] as const;

export default async function CustomerReports() {
  const clinicId = await getCurrentClinicId();
  if (!clinicId) {
    return <div className="p-6 text-rose-600">Please set clinic cookie to view reports.</div>;
  }

  const { data, error } = await supabaseServer
    .from("v_customer_reports" as any)
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  if (error) {
    return <pre className="p-6 text-sm text-rose-600 whitespace-pre-wrap">{error.message}</pre>;
  }

  const rows = (data ?? []) as unknown as ReportRow[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-gray-500">User-submitted reports for your clinic</p>
        </div>
        <div className="flex gap-2">
          <a href="/customer/reports" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
            ⟳ Refresh
          </a>
          <form action={deleteAllReportsAction}>
            <button className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-600">
              🗑 Delete All
            </button>
          </form>
        </div>
      </div>

      {/* Фильтры — заглушки */}
      <div className="rounded-xl border bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">All Statuses</label>
            <select className="w-full rounded-md border px-3 py-2" defaultValue="">
              <option value="">All Statuses</option>
              <option>New</option>
              <option>Processed</option>
              <option>Rejected</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Start Date</label>
            <input type="date" className="w-full rounded-md border px-3 py-2" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">End Date</label>
            <input type="date" className="w-full rounded-md border px-3 py-2" />
          </div>
          <div className="flex items-end justify-end">
            <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">Reset Filters</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-x-auto">
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-500">
          <div>Total: {rows.length}</div>
        </div>
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Reporter</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Relationship</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">{r.reporter ?? "—"}</td>
                <td className="px-4 py-3">{r.contact ?? "—"}</td>
                <td className="px-4 py-3">{r.relationship ?? "—"}</td>
                <td className="px-4 py-3 max-w-[420px] truncate" title={r.details ?? ""}>{r.details ?? "—"}</td>
                <td className="px-4 py-3">
                  <form action={async (formData) => {
                    "use server";
                    const next = (formData.get("status")?.toString() || "New") as any;
                    await updateReportStatusAction(r.id, next);
                  }}>
                    <div className="flex items-center gap-2">
                      <select name="status" defaultValue={(r.status[0].toUpperCase()+r.status.slice(1)) as any} className="rounded border px-2 py-1">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button type="submit" className="rounded border px-2 py-1">Save</button>
                    </div>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={async () => { "use server"; await deleteReportAction(r.id); }}>
                    <button className="rounded-md bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={8}>No reports found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form action={deleteAllReportsAction}>
        <button className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-600">
          🗑 Delete All
        </button>
      </form>
    </div>
  );
}
