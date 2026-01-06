import PatientsClient, { PatientRow } from "./patients-client";
import { createServerClient } from "@/lib/supabase/serverClient";

const PAGE_SIZE = 15;

function toDateOrNull(v: string | string[] | undefined) {
  if (!v || Array.isArray(v)) return null;
  const s = v.trim();
  if (!s) return null;
  // ожидаем YYYY-MM-DD
  return s;
}

export default async function AdminPatientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);
  const status = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const start = toDateOrNull(sp.start);
  const end = toDateOrNull(sp.end);

  const offset = (page - 1) * PAGE_SIZE;

  const sb = await createServerClient();

  const [{ data: rows, error }, { data: statuses }] = await Promise.all([
    sb.rpc("admin_patients_list", {
      p_status: status && status !== "all" ? status : null,
      p_start_date: start,
      p_end_date: end,
      p_limit: PAGE_SIZE,
      p_offset: offset,
    }),
    sb.rpc("admin_patient_statuses"),
  ]);

  if (error) {
    return (
      <pre style={{ padding: 16, whiteSpace: "pre-wrap" }}>
        admin_patients_list error: {JSON.stringify(error, null, 2)}
      </pre>
    );
  }

  const list = (rows ?? []) as PatientRow[];
  const totalCount = list[0]?.total_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const statusOptions = ["all", ...(statuses ?? []).map((r: any) => r.status).filter(Boolean)];

  return (
    <PatientsClient
      items={list}
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      pageSize={PAGE_SIZE}
      statusOptions={statusOptions}
      initialFilters={{
        status: status ?? "all",
        start: start ?? "",
        end: end ?? "",
      }}
    />
  );
}
