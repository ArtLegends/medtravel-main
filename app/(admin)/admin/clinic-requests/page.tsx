// app/(admin)/admin/clinic-requests/page.tsx

export const metadata = { title: 'Clinic Requests • Admin' };

// Если данные пока не подключены — можно оставить пустой массив
type RequestRow = {
  id: string;
  name: string;
  email: string;
  clinic: string;
  createdAt: string;
  status: 'new' | 'processed' | 'rejected';
};

// временный мок, чтобы страница была модульной и собиралась
async function getRequests(): Promise<RequestRow[]> {
  return [
    {
      id: 'req_1',
      name: 'John Doe',
      email: 'john@example.com',
      clinic: 'Premium Aesthetic Istanbul',
      createdAt: '2025-09-08 12:00',
      status: 'new',
    },
  ];
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
                <td className="p-3">{r.createdAt}</td>
                <td className="p-3 capitalize">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
