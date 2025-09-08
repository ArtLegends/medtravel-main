export const metadata = { title: 'Reports • Admin' };

type Row = {
  id: string;
  title: string;
  period: string;
  createdAt: string;
};

async function getRows(): Promise<Row[]> {
  return [
    { id: 'rp_1', title: 'Bookings by Services', period: 'Aug 2025', createdAt: '2025-09-01 08:00' },
  ];
}

export default async function ReportsPage() {
  const rows = await getRows();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Period</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.title}</td>
                <td className="p-3">{r.period}</td>
                <td className="p-3">{r.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
