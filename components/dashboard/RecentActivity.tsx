// components/dashboard/RecentActivity.tsx
type Item = { type: string; event: string; time: string; status?: string };

export default function RecentActivity({ items }: { items: Item[] }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm min-w-0 overflow-hidden">
      <div className="mb-3 text-sm font-medium">Recent Activity</div>
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="px-3 py-2 whitespace-nowrap">Type</th>
              <th className="px-3 py-2 whitespace-nowrap">Event</th>
              <th className="px-3 py-2 whitespace-nowrap">Time</th>
              <th className="px-3 py-2 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">{it.type}</td>
                <td className="px-3 py-2 max-w-[200px] truncate">{it.event}</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">{it.time}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {it.status ? (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                      {it.status}
                    </span>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}