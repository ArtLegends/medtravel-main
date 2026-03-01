// app/(admin)/admin/partners/page.tsx
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RequestRow = {
  id: string;
  user_id: string;
  program_key: string;
  status: string;
  ref_code: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type ProfileRow = {
  id: string;
  email: string | null;
};

function formatDate(v: string | null) {
  if (!v) return "-";
  return new Date(v).toLocaleString();
}

// server action: approve / reject
async function updateRequest(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const userId = String(formData.get("user_id") || "");
  const programKey = String(formData.get("program_key") || "");
  const action = String(formData.get("action") || ""); // approve / reject

  if (!id || !userId || !programKey || !action) return;

  const sb = createServiceClient();

  const status = action === "approve" ? "approved" : "rejected";
  let refCode: string | null = null;

  if (status === "approved") {
    refCode =
      "MT" + Math.random().toString(36).slice(2, 10).toUpperCase();
  }

  await sb
    .from("partner_program_requests")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      ref_code: refCode,
    } as any)
    .eq("id", id);

  if (status === "approved" && refCode) {
    const siteUrl =
      (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "") ||
      "https://medtravel.me";

    const referralUrl =
      programKey === "hair-transplant"
        ? `${siteUrl}/ru/hair-transplant/lp/${refCode}`
        : `${siteUrl}/ref/${refCode}`;

    await sb.from("notifications").insert({
      user_id: userId,
      type: "partner_program_approved",
      data: {
        program_key: programKey,
        ref_code: refCode,
        referral_url: referralUrl,
      },
    } as any);
  }

  revalidatePath("/admin/partners");
}

export default async function AdminPartnersPage() {
  const sb = createServiceClient();

  const { data: requestsRaw } = await sb
    .from("partner_program_requests")
    .select("*")
    .order("created_at", { ascending: false });

  const requests = (requestsRaw ?? []) as RequestRow[];

  const userIds = Array.from(new Set(requests.map((r) => r.user_id)));

  let profiles: ProfileRow[] = [];
  if (userIds.length > 0) {
    const { data: profilesRaw } = await sb
      .from("profiles")
      .select("id,email")
      .in("id", userIds);

    profiles = (profilesRaw ?? []) as ProfileRow[];
  }

  const emailById = new Map<string, string | null>();
  profiles.forEach((p) => emailById.set(p.id, p.email));

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Partner program requests</h1>
        <p className="text-sm text-gray-600">
          Review partner requests to join MedTravel affiliate programs.
        </p>
      </header>

      <section className="rounded-2xl border bg-white p-4 md:p-5">
        {requests.length === 0 ? (
          <p className="text-sm text-gray-500">
            No partner requests yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                  <th className="px-3 py-2">Partner</th>
                  <th className="px-3 py-2">Program</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Ref code</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Reviewed</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const email = emailById.get(r.user_id) ?? "—";
                  return (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span>{email}</span>
                          <span className="text-[11px] text-gray-400">
                            {r.user_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-medium">
                          {r.program_key}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            r.status === "approved"
                              ? "bg-emerald-50 text-emerald-700"
                              : r.status === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700",
                          ].join(" ")}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {r.ref_code ? (
                          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                            {r.ref_code}
                          </code>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="px-3 py-2">
                        {formatDate(r.reviewed_at)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <form action={updateRequest}>
                            <input type="hidden" name="id" value={r.id} />
                            <input
                              type="hidden"
                              name="user_id"
                              value={r.user_id}
                            />
                            <input
                              type="hidden"
                              name="program_key"
                              value={r.program_key}
                            />
                            <input
                              type="hidden"
                              name="action"
                              value="approve"
                            />
                            <button
                              type="submit"
                              disabled={r.status !== "pending"}
                              className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-40"
                            >
                              Approve
                            </button>
                          </form>
                          <form action={updateRequest}>
                            <input type="hidden" name="id" value={r.id} />
                            <input
                              type="hidden"
                              name="user_id"
                              value={r.user_id}
                            />
                            <input
                              type="hidden"
                              name="program_key"
                              value={r.program_key}
                            />
                            <input
                              type="hidden"
                              name="action"
                              value="reject"
                            />
                            <button
                              type="submit"
                              disabled={r.status !== "pending"}
                              className="rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-700 disabled:opacity-40"
                            >
                              Reject
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-gray-400">
        On approve the system generates a referral code and sends a
        notification to the partner with their personal referral link.
      </p>
    </main>
  );
}
