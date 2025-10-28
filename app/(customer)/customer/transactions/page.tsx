export const metadata = { title: 'Customer • Transactions' };

type InvoiceStatus = 'Issued' | 'Paid' | 'Overdue';

type InvoiceRow = {
    id: string;
    status: InvoiceStatus | string; // приходит что угодно
    price: number;
};

// безопасно приводим к union
function toInvoiceStatus(s: string): InvoiceStatus {
    const v = s.trim().toLowerCase();
    if (v === 'paid') return 'Paid';
    if (v === 'overdue') return 'Overdue';
    return 'Issued';
}

export default function TransactionsPage() {
    const invoices = [
        { id: 'IID 21201', status: 'Issued', price: '$ 500' },
        { id: 'IID 21304', status: 'Paid', price: '$ 500' },
        { id: 'IID 22145', status: 'Overdue', price: '$ 500' },
        { id: 'IID 22512', status: 'Paid', price: '$ 500' },
    ];

    return (
        <div className="space-y-6">
            <header>
                <div className="text-sm text-gray-500">Customer Panel</div>
                <h1 className="text-2xl font-semibold">Transactions</h1>
                <p className="text-sm text-gray-600">
                    Manage and view all transaction records
                </p>
            </header>

            {/* Balance */}
            <div className="rounded-xl border bg-white p-4">
                <div className="text-sm text-gray-600">Balance</div>
                <div className="mt-1 text-2xl font-semibold text-rose-600">-$ 1500</div>
            </div>

            {/* Filters */}
            <div className="rounded-xl border bg-white p-4">
                <div className="mb-3 flex flex-wrap items-end gap-3">
                    <button className="rounded-md border px-3 py-2 text-sm">
                        ⟳ Refresh Transactions
                    </button>
                    <button className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white">
                        🗑 Delete All
                    </button>
                    <div className="grow" />
                    <select className="rounded-md border px-3 py-2 text-sm">
                        <option>All Statuses</option>
                    </select>
                    <input
                        type="date"
                        className="rounded-md border px-3 py-2 text-sm"
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        className="rounded-md border px-3 py-2 text-sm"
                        placeholder="End Date"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-gray-500">
                                <th className="px-3 py-2">Invoice ID</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Invoice Price</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((row) => (
                                <tr key={row.id} className="border-b">
                                    <td className="px-3 py-3">{row.id}</td>
                                    <td className="px-3 py-3">
                                        <Badge status={toInvoiceStatus(String(row.status))} />
                                    </td>
                                    <td className="px-3 py-3">{row.price}</td>
                                    <td className="px-3 py-3 text-right">
                                        <button className="rounded-md border px-3 py-1 text-xs">
                                            ⬇ Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-2 p-3">
                        <button className="rounded-md border px-3 py-1 text-sm">‹ Previous</button>
                        <span className="rounded-md border px-3 py-1 text-sm">1</span>
                        <button className="rounded-md border px-3 py-1 text-sm">Next ›</button>
                    </div>

                    <div className="px-3 pb-2 text-xs text-gray-500">
                        Showing 1 to 4 of 4 transactions
                    </div>
                </div>
            </div>
        </div>
    );
}

function Badge({ status }: { status: 'Issued' | 'Paid' | 'Overdue' }) {
    const map = {
        Issued: 'bg-blue-50 text-blue-600',
        Paid: 'bg-emerald-50 text-emerald-600',
        Overdue: 'bg-rose-50 text-rose-600',
    } as const;
    return (
        <span className={`rounded-full px-2 py-1 text-xs ${map[status]}`}>{status}</span>
    );
}
