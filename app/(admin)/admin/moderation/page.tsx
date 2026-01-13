// app/(admin)/admin/moderation/page.tsx

import Link from "next/link";
import { createServerClient } from "@/lib/supabase/serverClient";
import { approveClinic, rejectClinic } from "./actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

type ModerationQueueRow = {
  clinic_id: string;
  name: string | null;
  slug: string | null;
  city: string | null;
  country: string | null;
  moderation_status: "draft" | "pending" | "approved" | "rejected" | null;
  draft_status: "editing" | "pending" | "published" | "draft" | null;
  draft_updated_at: string | null;
};

// В Next 15 searchParams в пропсах страницы — это Promise
type ModerationPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

export default async function ModerationPage({ searchParams }: ModerationPageProps) {
  const supabase = await createServerClient();
  const sp = await searchParams;

  const getParam = (key: string): string | undefined => {
    const v = sp?.[key];
    if (Array.isArray(v)) return v[0];
    return v;
  };

  // ---- фильтр по статусу ---------------------------------------------------
  const rawStatusParam = getParam("status");
  const rawStatus = (rawStatusParam ?? "all") as
    | "all"
    | "pending"
    | "approved"
    | "rejected";

  const statusFilter: "all" | "pending" | "approved" | "rejected" =
    ["pending", "approved", "rejected"].includes(rawStatus)
      ? rawStatus
      : "all";

  // ---- пагинация -----------------------------------------------------------
  const rawPageParam = getParam("page");
  const rawPage = Number(rawPageParam ?? "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("moderation_queue_v2")
    .select("*", { count: "exact" })
    .not("slug", "ilike", "dev-%")
    .not("name", "ilike", "dev%")
    // ✅ показываем только отправленные на модерацию / уже обработанные
    .in("moderation_status", ["pending", "approved", "rejected"]);

  if (statusFilter !== "all") {
    query = query.eq("moderation_status", statusFilter);
  }

  const { data, error, count } = await query
    .order("draft_updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Load error: {error.message}
      </div>
    );
  }

  const rows = (data ?? []) as ModerationQueueRow[];
  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

  const makeStatusHref = (status: "all" | "pending" | "approved" | "rejected") => {
    const query: Record<string, string> = {};
    if (status !== "all") query.status = status;
    query.page = "1"; // при смене статуса всегда на первую страницу

    return {
      pathname: "/admin/moderation",
      query,
    };
  };

  const makePageHref = (targetPage: number) => {
    const query: Record<string, string> = { page: String(targetPage) };
    if (statusFilter !== "all") query.status = statusFilter;
    return {
      pathname: "/admin/moderation",
      query,
    };
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Moderation queue</h1>

        {/* Фильтры по статусу */}
        <div className="flex items-center gap-2 text-sm">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => {
            const isActive = statusFilter === status;
            return (
              <Link
                key={status}
                href={makeStatusHref(status)}
                className={[
                  "rounded-full border px-3 py-1 capitalize",
                  isActive
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                {status === "all" ? "All" : status}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Clinic</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-center">Status</th>
              <th className="px-3 py-2 text-center">Draft</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.clinic_id} className="border-t">
                <td className="px-3 py-2">
                  <div className="font-medium">
                    <Link
                      className="text-blue-600 hover:underline"
                      href={`/admin/moderation/detail?id=${r.clinic_id}`}
                    >
                      {r.name || "(no name)"}
                    </Link>
                  </div>
                  <div className="text-gray-500 text-xs">{r.slug}</div>
                </td>

                <td className="px-3 py-2">
                  {[r.city, r.country].filter(Boolean).join(", ")}
                </td>

                <td className="px-3 py-2 text-center">
                  <span className="rounded-full bg-gray-100 px-2 py-1">
                    {r.moderation_status ?? "pending"}
                  </span>
                </td>

                <td className="px-3 py-2 text-center">
                  <span className="rounded-full bg-gray-100 px-2 py-1">
                    {r.draft_status ?? "-"}
                  </span>
                </td>

                <td className="px-3 py-2">
                  <div className="flex items-center gap-2 justify-end">
                    {/* APPROVE */}
                    <form action={approveClinic}>
                      <input type="hidden" name="clinicId" value={r.clinic_id} />
                      <button
                        className="rounded-md bg-emerald-600 text-white px-3 py-1 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={r.draft_status !== "pending"}
                        title={
                          r.draft_status !== "pending"
                            ? "Approve доступен только для черновиков в статусе pending"
                            : ""
                        }
                      >
                        Approve
                      </button>
                    </form>

                    {/* REJECT */}
                    <form action={rejectClinic} className="flex items-center gap-2">
                      <input type="hidden" name="clinicId" value={r.clinic_id} />
                      <input
                        name="reason"
                        placeholder="Reason"
                        className="rounded-md border px-2 py-1 text-sm"
                      />
                      <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50">
                        Reject
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {!rows.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-gray-500"
                >
                  Queue is empty
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          {total > 0 ? (
            <>
              Showing{" "}
              <span className="font-medium">
                {Math.min(from + 1, total)}–{Math.min(to + 1, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span>
            </>
          ) : (
            "No clinics to show"
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={makePageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={[
              "rounded-md border px-3 py-1",
              page <= 1
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-50",
            ].join(" ")}
          >
            Previous
          </Link>
          <span>
            Page <span className="font-medium">{page}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </span>
          <Link
            href={makePageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={[
              "rounded-md border px-3 py-1",
              page >= totalPages || totalPages === 0
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-50",
            ].join(" ")}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
