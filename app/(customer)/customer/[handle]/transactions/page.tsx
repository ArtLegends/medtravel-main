import TableShell from "@/components/customer/TableShell";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-gray-600 mt-2">Manage and view all transaction records</p>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-lg font-semibold">Balance</div>
        <div className="text-2xl font-bold mt-1">-$ 0</div>
      </div>

      <div className="rounded-xl border bg-white p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button className="border rounded-md px-3 py-2 text-sm hover:bg-gray-50">Refresh</button>
          <button className="rounded-md px-3 py-2 text-sm bg-rose-500 text-white hover:bg-rose-600">Delete All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="w-full px-3 py-2 border rounded-md">
            <option>All Statuses</option>
            <option>Paid</option><option>Overdue</option><option>Draft</option>
          </select>
          <button className="border rounded-md px-3 py-2 text-sm text-left">🗓 Start Date</button>
          <button className="border rounded-md px-3 py-2 text-sm text-left">🗓 End Date</button>
        </div>
      </div>

      <TableShell
        head={
          <>
            <th className="px-4 py-3 text-left">Invoice ID</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Amount</th>
            <th className="px-4 py-3 text-left">Created</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </>
        }
        empty={<span className="text-gray-500">No invoices yet</span>}
      />
    </div>
  );
}
