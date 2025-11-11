import Link from "next/link";
import { createServerClient } from "@/lib/supabase/serverClient";
import { approveClinic, rejectClinic } from "./actions";

export const dynamic = "force-dynamic";

type ModerationQueueRow = {
  clinic_id: string;
  name: string | null;
  slug: string | null;
  city: string | null;
  country: string | null;
  moderation_status: "pending" | "approved" | "rejected" | null;
  draft_status: "editing" | "pending" | "published" | "draft" | null;
  draft_updated_at: string | null;
};

export default async function ModerationPage() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("moderation_queue_v2")
    .select("*")
    .order("draft_updated_at", { ascending: false })
    .limit(100);

  if (error) {
    return <div className="p-6 text-red-600">Load error: {error.message}</div>;
  }

  const rows: ModerationQueueRow[] = (data ?? []) as ModerationQueueRow[];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Moderation queue</h1>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Clinic</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Draft</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.clinic_id} className="border-t">
                <td className="px-3 py-2">
                  <div className="font-medium">
                    <Link
                      className="text-blue-600 hover:underline"
                      href={`/admin/moderation/${r.clinic_id}`}
                    >
                      {r.name || "(no name)"}
                    </Link>
                  </div>
                  <div className="text-gray-500">{r.slug}</div>
                </td>
                <td className="px-3 py-2">
                  {[r.city, r.country].filter(Boolean).join(", ")}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="rounded-full bg-gray-100 px-2 py-1">
                    {r.moderation_status}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="rounded-full bg-gray-100 px-2 py-1">
                    {r.draft_status || "-"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2 justify-end">
                    <form action={approveClinic}>
                      <input type="hidden" name="clinicId" value={r.clinic_id} />
                      <button
                        className="rounded-md bg-emerald-600 text-white px-3 py-1 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={r.draft_status !== 'pending'}   // 👈 можно только когда pending
                        title={r.draft_status !== 'pending' ? 'Approve доступен только для черновиков в статусе pending' : ''}
                      >
                        Approve
                      </button>
                    </form>

                    <RejectForm clinicId={r.clinic_id} />
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                  Queue is empty
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RejectForm({ clinicId }: { clinicId: string }) {
  return (
    <form action={rejectClinic} className="flex items-center gap-2">
      <input type="hidden" name="clinicId" value={clinicId} />
      <input
        name="reason"
        placeholder="Reason"
        className="rounded-md border px-2 py-1 text-sm"
      />
      <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50">
        Reject
      </button>
    </form>
  );
}
