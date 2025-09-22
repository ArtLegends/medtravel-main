export const metadata = { title: 'Reviews • Admin' };

type Row = {
  id: string;
  clinic: string;
  author: string;
  rating: number; // 1..5
  createdAt: string;
  status: 'new' | 'approved' | 'rejected';
};

async function getRows(): Promise<Row[]> {
  return [
    { id: 'rv_1', clinic: 'Dr Çağatay Özyıldırım', author: 'Sarah J.', rating: 5, createdAt: '2025-09-08 12:10', status: 'new' },
  ];
}

export default async function ReviewsPage() {
  const rows = await getRows();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reviews</h1>

      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Clinic</th>
              <th className="p-3">Author</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Created</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.clinic}</td>
                <td className="p-3">{r.author}</td>
                <td className="p-3">{r.rating}/5</td>
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
