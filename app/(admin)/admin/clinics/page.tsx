export const metadata = { title: 'Clinics • Admin' };

type Row = {
  id: string;
  name: string;
  country: string;
  city: string;
  createdAt: string;
  status: 'active' | 'draft';
};

async function getRows(): Promise<Row[]> {
  return [
    { id: 'cl_1', name: 'Dr Çağatay Özyıldırım', country: 'Turkey', city: 'Istanbul', createdAt: '2025-09-08 12:00', status: 'active' },
  ];
}

export default async function ClinicsPage() {
  const rows = await getRows();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clinics</h1>

      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Country</th>
              <th className="p-3">City</th>
              <th className="p-3">Created</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.country}</td>
                <td className="p-3">{r.city}</td>
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
