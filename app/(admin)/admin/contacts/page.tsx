export const metadata = { title: 'Contacts • Admin' };

type Row = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
};

async function getRows(): Promise<Row[]> {
  return [
    { id: 'ct_1', name: 'John Doe', email: 'john@example.com', phone: '+1 202 555 0182', createdAt: '2025-09-08 12:05' },
  ];
}

export default async function ContactsPage() {
  const rows = await getRows();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Contacts</h1>

      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{r.phone ?? '—'}</td>
                <td className="p-3">{r.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
