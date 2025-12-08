// app/(patient)/patient/page.tsx

export const dynamic = "force-dynamic";

export default async function PatientDashboardPage() {
  const stats = {
    upcomingAppointments: 0,
    totalVisits: 0,
    activeBookings: 0,
    notifications: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your upcoming appointments and medical visits.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Upcoming Appointments"
          value={stats.upcomingAppointments}
          helper="No upcoming appointments"
        />
        <StatCard
          label="Total Visits"
          value={stats.totalVisits}
          helper="Medical visits completed"
        />
        <StatCard
          label="Active Bookings"
          value={stats.activeBookings}
          helper="Pending appointments"
        />
        <StatCard
          label="Notifications"
          value={stats.notifications}
          helper="Unread messages"
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <section className="lg:col-span-2 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            Recent Activity
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Your latest medical appointments and activities
          </p>

          <div className="mt-8 flex flex-col items-center justify-center py-10 text-center text-sm text-gray-500">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-gray-300">
              <span className="text-xl">↻</span>
            </div>
            <div className="font-medium text-gray-700">No recent activity</div>
            <p className="mt-1 text-xs text-gray-500 max-w-sm">
              Your recent appointments and visits will appear here after you
              book or complete a consultation.
            </p>
          </div>
        </section>

        {/* Quick actions */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            Quick Actions
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Common tasks and shortcuts
          </p>

          <div className="mt-4 space-y-2">
            <QuickAction href="/patient/appointment" label="Book New Appointment">
              📅
            </QuickAction>
            <QuickAction href="/patient/visits" label="View Visit History">
              ⏱️
            </QuickAction>
            <QuickAction href="/settings" label="Update Profile">
              👤
            </QuickAction>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard(props: { label: string; value: number; helper?: string }) {
  const { label, value, helper } = props;
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold text-gray-900">{value}</div>
      {helper && (
        <div className="mt-1 text-xs text-gray-500">
          {value === 0 ? helper : null}
        </div>
      )}
    </div>
  );
}

function QuickAction({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      <span className="flex items-center gap-2">
        {children && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-xs">
            {children}
          </span>
        )}
        {label}
      </span>
      <span className="text-xs text-gray-400">→</span>
    </a>
  );
}
