// app/(customer)/customer/inquiries/page.tsx
import CustomerClinicInquiriesTable, { type Row } from "@/components/customer/inquiries/CustomerClinicInquiriesTable";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const LIMIT = 15;

type Search = { page?: string; start?: string; end?: string; status?: string };

export default async function Page({ searchParams }: { searchParams?: Promise<Search> }) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page) || 1);
  const from = (page - 1) * LIMIT;
  const to = from + LIMIT - 1;

  const startISO = sp.start || "";
  const endISO = sp.end || "";
  const status = sp.status || "all";

  const store = await cookies();

  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll().map(c => ({ name: c.name, value: c.value })),
        setAll: () => {},
      },
    }
  );

  // железобетонно проверяем, что есть user (иначе auth.uid() будет null)
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) redirect(`/login?as=CUSTOMER&next=${encodeURIComponent("/customer/inquiries")}`);

  let sel = sb
    .from("v_customer_clinic_inquiries" as any)
    .select("*", { count: "exact", head: false });

  if (startISO) sel = sel.gte("created_at", startISO);
  if (endISO) sel = sel.lte("created_at", endISO);
  if (status && status !== "all") sel = sel.eq("status", status);

  sel = sel.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await sel;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load inquiries: {error.message}
      </div>
    );
  }

  const rows: Row[] = (data ?? []) as any;
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-6">
      <CustomerClinicInquiriesTable
        rows={rows}
        total={total}
        page={page}
        pages={pages}
        start={startISO}
        end={endISO}
        status={status}
        limit={LIMIT}
      />
    </div>
  );
}
