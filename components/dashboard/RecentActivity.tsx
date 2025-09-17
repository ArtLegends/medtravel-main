// components/admin/dashboard/RecentActivity.tsx
type Item = { type: string; event: string; time: string; status?: string };

export default function RecentActivity({ items }: { items: Item[] }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-medium">Recent Activity</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Event</th>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2">{it.type}</td>
                <td className="px-3 py-2">{it.event}</td>
                <td className="px-3 py-2">{it.time}</td>
                <td className="px-3 py-2">
                  {it.status ? (
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                      {it.status}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
