export default function TableShell({
  head,
  children,
  empty,
}: {
  head: React.ReactNode;
  children?: React.ReactNode;
  empty?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>{head}</tr>
          </thead>
          <tbody>
            {children ? children : (
              <tr>
                <td colSpan={20} className="px-4 py-10 text-center text-gray-500">
                  {empty ?? 'No records found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
