// app/(admin)/admin/clinic-requests/page.tsx
import fs from 'node:fs/promises';
import path from 'node:path';

export const metadata = { title: 'Clinic Requests • Admin' };

type RequestRow = {
  id: string;
  name: string;
  email: string;
  clinic: string;
  createdAt: string;
  status: 'new' | 'processed' | 'rejected';
  phone?: string | null;
};

async function getRequests(): Promise<RequestRow[]> {
  const file = path.join(process.cwd(), 'data', 'clinic-requests.json');
  try {
    const raw = await fs.readFile(file, 'utf8');
    const rows = JSON.parse(raw) as RequestRow[];
    return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return [];
  }
}

export default async function ClinicRequestsPage() {
  const rows = await getRequests();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clinic Requests</h1>

      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Clinic</th>
              <th className="p-3">Created</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{r.clinic}</td>
                <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-3 capitalize">{r.status}</td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={5}>
                  No requests yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
