// app/(customer)/customer/reviews/page.tsx
import React from "react";
import TableShell from "@/components/customer/TableShell";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentClinicId } from "@/app/(customer)/customer/_utils/getCurrentClinicId";
import {
  updateReviewStatusAction,
  deleteReviewAction,
} from "./actions";
import { DeleteAllReviewsButton } from "./DeleteAllReviewsButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = {
  id: string;
  clinic_id: string | null;
  created_at: string | null;
  reviewer: string | null;
  rating: string | number | null;
  comment: string | null;
  status: string | null;
};

const STATUS_OPTIONS = ["new", "published", "rejected"] as const;
const PAGE_SIZE = 10;

// универсальный хелпер: достаёт строку из searchParams
function getParam(raw: any, key: string): string {
  if (!raw) return "";
  // новый формат: ReadonlyURLSearchParams
  if (typeof raw.get === "function") {
    return raw.get(key) ?? "";
  }
  const v = raw[key];
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export default async function ReviewsPage(props: any) {
  const clinicId = await getCurrentClinicId();
  if (!clinicId) {
    return (
      <div className="p-6 text-rose-600">
        No clinic is linked to this account yet. Please contact MedTravel support.
      </div>
    );
  }

  // Next 15: searchParams — это Promise<ReadonlyURLSearchParams>
  const rawSearchParams = await props?.searchParams;

  const statusParam = getParam(rawSearchParams, "status");
  const startParam = getParam(rawSearchParams, "start");
  const endParam = getParam(rawSearchParams, "end");
  const pageParam = getParam(rawSearchParams, "page") || "1";

  const currentPage = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabaseServer
    .from("v_customer_reviews" as any)
    .select("*", { count: "exact" })
    .eq("clinic_id", clinicId);

  if (statusParam && statusParam !== "all") {
    query = query.eq("status", statusParam);
  }

  if (startParam) {
    const startIso = new Date(startParam + "T00:00:00.000Z").toISOString();
    query = query.gte("created_at", startIso);
  }

  if (endParam) {
    const endIso = new Date(endParam + "T23:59:59.999Z").toISOString();
    query = query.lte("created_at", endIso);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return (
      <pre className="p-6 text-sm text-rose-600 whitespace-pre-wrap">
        {error.message}
      </pre>
    );
  }

  const rows = (data ?? []) as unknown as Row[];
  const total = count ?? rows.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const makePageLink = (page: number) => {
    const params = new URLSearchParams();
    if (statusParam) params.set("status", statusParam);
    if (startParam) params.set("start", startParam);
    if (endParam) params.set("end", endParam);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/customer/reviews?${qs}` : "/customer/reviews";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-gray-500">Manage clinic reviews</p>
        </div>
        {/* только верхняя Delete All с подтверждением (клиентский компонент) */}
        <DeleteAllReviewsButton />
      </div>

      {/* Filters card — такой же стиль, как в bookings/reports */}
      <div className="rounded-xl border bg-white p-4">
        <form
          method="get"
          className="grid grid-cols-1 gap-4 md:grid-cols-4 items-end"
        >
          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium">All Statuses</label>
            <select
              name="status"
              defaultValue={statusParam || ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Start date */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              name="start"
              defaultValue={startParam || ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End date */}
          <div className="space-y-1">
            <label className="text-sm font-medium">End Date</label>
            <input
              type="date"
              name="end"
              defaultValue={endParam || ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="submit"
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Apply
            </button>
            <a
              href="/customer/reviews"
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Reset Filters
            </a>
          </div>
        </form>
      </div>

      {/* Table + pagination */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-500">
          <div>Total: {total}</div>
          <div>
            Page {currentPage} of {pageCount}
          </div>
        </div>

        <TableShell
          head={
            <>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Reviewer</th>
              <th className="px-4 py-3 text-left">Rating</th>
              <th className="px-4 py-3 text-left">Comment</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </>
          }
          empty={<span className="text-gray-500">No reviews yet</span>}
        >
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-2">
                {r.created_at
                  ? new Date(r.created_at).toLocaleString()
                  : "—"}
              </td>
              <td className="px-4 py-2">{r.reviewer ?? "—"}</td>
              <td className="px-4 py-2">{r.rating ?? "—"}</td>
              <td className="px-4 py-2 max-w-[520px] truncate">
                {r.comment ?? "—"}
              </td>
              <td className="px-4 py-2">
                <form
                  action={async (fd) => {
                    "use server";
                    const val = fd.get("status")?.toString() ?? "new";
                    await updateReviewStatusAction(r.id, val);
                  }}
                  className="flex items-center gap-2"
                >
                  <select
                    name="status"
                    defaultValue={r.status ?? "new"}
                    className="rounded border px-2 py-1 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
                  >
                    Save
                  </button>
                </form>
              </td>
              <td className="px-4 py-2">
                <form
                  action={async () => {
                    "use server";
                    await deleteReviewAction(r.id);
                  }}
                >
                  <button className="rounded-md bg-rose-500 px-3 py-1.5 text-sm text-white hover:bg-rose-600">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </TableShell>

        {/* Pagination controls */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              Showing {from + 1}–
              {Math.min(from + PAGE_SIZE, total)} of {total}
            </div>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <a
                  href={makePageLink(currentPage - 1)}
                  className="rounded-md border px-3 py-1.5 hover:bg-gray-50"
                >
                  Previous
                </a>
              )}
              {currentPage < pageCount && (
                <a
                  href={makePageLink(currentPage + 1)}
                  className="rounded-md border px-3 py-1.5 hover:bg-gray-50"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
