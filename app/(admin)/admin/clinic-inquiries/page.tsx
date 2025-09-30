// app/(admin)/admin/clinic-inquiries/page.tsx
import { createClient } from "@supabase/supabase-js";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Table, Th, Tr, Td } from "@/components/admin/Table";
import Badge from "@/components/admin/Badge";

type Row = {
  id: string;
  clinic_name: string;
  clinic_slug: string;
  name: string;
  email: string | null;
  phone: string;
  service: string | null;
  status: string;
  created_at: string;
};

function statusColor(s: string): "green" | "blue" | "red" | "gray" {
  const v = (s || "").toLowerCase();
  if (v === "new") return "blue";
  if (v === "resolved" || v === "processed") return "green";
  if (v === "rejected") return "red";
  return "gray";
}

async function getRows(): Promise<Row[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
  );

  const { data, error } = await supabase
    .from("clinic_inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error("Clinic inquiries fetch error:", error);
    return [];
  }
  return (data ?? []) as Row[];
}

export const metadata = { title: "Clinic Inquiries • Admin" };

export default async function ClinicInquiriesPage() {
  const rows = await getRows();

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="Clinic Inquiries"
        subtitle="Manage inquiries from clinic detail pages (Claim your free quote)"
      />

      <div className="rounded-lg border bg-white">
        <Table>
          <thead className="bg-slate-50 text-left">
            <Tr>
              <Th>Date</Th>
              <Th>Clinic</Th>
              <Th>Name</Th>
              <Th>Contact</Th>
              <Th>Service</Th>
              <Th>Status</Th>
            </Tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <Tr key={r.id}>
                <Td>{new Date(r.created_at).toLocaleString()}</Td>
                <Td>
                  <a
                    href={`/clinic/${r.clinic_slug}`}
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    {r.clinic_name}
                  </a>
                </Td>
                <Td>{r.name}</Td>
                <Td>
                  <div className="space-y-0.5">
                    {r.phone}
                    {r.email ? <div className="text-xs text-gray-500">{r.email}</div> : null}
                  </div>
                </Td>
                <Td>{r.service ?? "—"}</Td>
                <Td><Badge color={statusColor(r.status)}>{r.status}</Badge></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
