// app/(partner)/partner/page.tsx

type ProgramRow = {
    id: string;
    name: string;
    impressions: number;
    clicks: number;
    pending: number;
    cancelled: number;
    paid: number;
    payout: number;
    potentialPayouts: number;
  };
  
  // 👇 временные статичные данные; позже сюда подставим данные из Supabase
  const PROGRAMS: ProgramRow[] = [
    // {
    //   id: "dentistry",
    //   name: "Dentistry",
    //   impressions: 0,
    //   clicks: 0,
    //   pending: 0,
    //   cancelled: 0,
    //   paid: 0,
    //   payout: 0,
    //   potentialPayouts: 0,
    // },
    // {
    //   id: "hair-transplant",
    //   name: "Hair Transplant",
    //   impressions: 0,
    //   clicks: 0,
    //   pending: 0,
    //   cancelled: 0,
    //   paid: 0,
    //   payout: 0,
    //   potentialPayouts: 0,
    // },
    // {
    //   id: "plastic-surgery",
    //   name: "Plastic Surgery",
    //   impressions: 0,
    //   clicks: 0,
    //   pending: 0,
    //   cancelled: 0,
    //   paid: 0,
    //   payout: 0,
    //   potentialPayouts: 0,
    // },
  ];
  
  // Подготовка функции для будущей агрегации (уже готова к реальным данным)
  function getTotals(rows: ProgramRow[]): ProgramRow {
    return rows.reduce<ProgramRow>(
      (acc, row) => ({
        ...acc,
        impressions: acc.impressions + row.impressions,
        clicks: acc.clicks + row.clicks,
        pending: acc.pending + row.pending,
        cancelled: acc.cancelled + row.cancelled,
        paid: acc.paid + row.paid,
        payout: acc.payout + row.payout,
        potentialPayouts: acc.potentialPayouts + row.potentialPayouts,
      }),
      {
        id: "total",
        name: "Total",
        impressions: 0,
        clicks: 0,
        pending: 0,
        cancelled: 0,
        paid: 0,
        payout: 0,
        potentialPayouts: 0,
      }
    );
  }
  
  function StatCard({ title, value }: { title: string; value: string }) {
    return (
      <div className="rounded-xl border bg-white px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {title}
        </div>
        <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
      </div>
    );
  }
  
  function formatMonthYear(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);
  }
  
  export default function PartnerDashboardPage() {
    const today = new Date();
  
    const thisMonthLabel = formatMonthYear(today);
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthLabel = formatMonthYear(lastMonthDate);
  
    const totals = getTotals(PROGRAMS);
  
    return (
      <div className="space-y-6">
        {/* Заголовок */}
        <div>
          <h1 className="text-2xl font-bold">Welcome to Partner Panel!</h1>
          <p className="text-gray-600">
            Track your referral performance and payouts.
          </p>
        </div>
  
        {/* Статистика: Today / Yesterday / This month / Last month */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Today" value="$0" />
          <StatCard title="Yesterday" value="$0" />
          <StatCard title={thisMonthLabel} value="$0" />
          <StatCard title={lastMonthLabel} value="$0" />
        </div>
  
        {/* Programs Performance */}
        <div className="rounded-xl border bg-white p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Programs Performance</h2>
          </div>
  
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                  <th className="px-3 py-2">Landing page</th>
                  <th className="px-3 py-2">Impressions</th>
                  <th className="px-3 py-2">Clicks</th>
                  <th className="px-3 py-2">Pending</th>
                  <th className="px-3 py-2">Cancelled</th>
                  <th className="px-3 py-2">Paid</th>
                  <th className="px-3 py-2">Payout</th>
                  <th className="px-3 py-2">Potential payouts</th>
                </tr>
              </thead>
              <tbody>
                {/* Итоговая строка Total — всегда первая */}
                <tr className="border-b bg-gray-50 font-semibold">
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2">{totals.impressions}</td>
                  <td className="px-3 py-2">{totals.clicks}</td>
                  <td className="px-3 py-2">{totals.pending}</td>
                  <td className="px-3 py-2">{totals.cancelled}</td>
                  <td className="px-3 py-2">{totals.paid}</td>
                  <td className="px-3 py-2">${totals.payout}</td>
                  <td className="px-3 py-2">${totals.potentialPayouts}</td>
                </tr>
  
                {/* Отдельные программы (пока всё по нулям) */}
                {PROGRAMS.map((program) => (
                  <tr key={program.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{program.name}</td>
                    <td className="px-3 py-2">{program.impressions}</td>
                    <td className="px-3 py-2">{program.clicks}</td>
                    <td className="px-3 py-2">{program.pending}</td>
                    <td className="px-3 py-2">{program.cancelled}</td>
                    <td className="px-3 py-2">{program.paid}</td>
                    <td className="px-3 py-2">${program.payout}</td>
                    <td className="px-3 py-2">${program.potentialPayouts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  