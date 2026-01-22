export const dynamic = "force-dynamic";

async function apiGet(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || "Failed");
  return j;
}

export default async function Page() {
  const data = await apiGet(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/admin/customer-signup-requests`);
  const items = data.items ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Customer Sign-up Requests</h1>

      <div className="rounded-xl border bg-white">
        <div className="grid grid-cols-5 gap-2 border-b p-3 text-xs font-semibold text-gray-600">
          <div>Email</div>
          <div>Status</div>
          <div>Created</div>
          <div>Decided</div>
          <div className="text-right">Actions</div>
        </div>

        {items.map((r: any) => (
          <Row key={r.id} row={r} />
        ))}
      </div>
    </div>
  );
}

function fmt(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

// вынеси в отдельный client component файл при желании
function Row({ row }: { row: any }) {
  return null;
}
