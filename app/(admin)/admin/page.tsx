// app/(admin)/admin/page.tsx
import StatCard from "@/components/dashboard/StatCard";
import TrendsChart from "@/components/dashboard/TrendsChart";
import ClinicStatusPie from "@/components/dashboard/ClinicStatusPie";
import RecentActivity from "@/components/dashboard/RecentActivity";

export const metadata = {
  title: "Admin — Dashboard | MedTravel",
};

export default async function Page() {
  // TODO: заменить на реальные запросы в Supabase
  const stats = {
    bookings: { total: 25, new: 21, processed: 2, rejected: 2 },
    clinics: { total: 8, published: 8, pending: 6, rejected: 2 },
    requests: { total: 11, pending: 6, approved: 8, rejected: 2 },
    contacts: { total: 0, new: 0, processed: 0 },
    reviews: { total: 9, pending: 2, published: 6, rejected: 1, avg: 4.4 },
    reports: { total: 1, new: 0, inProgress: 0, resolved: 1 },
    inquiries: { total: 1, new: 0, resolved: 1 },
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const series = [
    { label: "New",       color: "#6366f1", values: [4, 6, 12, 8, 14, 10] },
    { label: "Processed", color: "#22c55e", values: [3, 4, 5, 12, 16, 13] },
    { label: "Rejected",  color: "#ef4444", values: [1, 1, 2, 2, 3, 2]   },
  ];

  const statusPie = [
    { label: "Published", color: "#16a34a", value: 57 },
    { label: "Pending",   color: "#f59e0b", value: 29 },
    { label: "Rejected",  color: "#ef4444", value: 14 },
  ];

  const recent = [
    { type: "Booking", event: "New booking — John Doe booked a consultation", time: "10 minutes ago", status: "New" },
    { type: "Clinic", event: "Clinic Published — DentalCare Clinic", time: "2 hours ago", status: "Published" },
    { type: "Report", event: "New report created", time: "5 hours ago", status: "New" },
    { type: "Review", event: "New 5-star review submitted", time: "1 day ago", status: "Pending" },
    { type: "Inquiry", event: "New message about Hair Transplant Clinic", time: "2 days ago", status: "New" },
  ];

  return (
    <div className="space-y-6">
      {/* верхняя сетка карточек */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Bookings"
          value={stats.bookings.total}
          footer={`New: ${stats.bookings.new} • Processed: ${stats.bookings.processed} • Rejected: ${stats.bookings.rejected}`}
        />
        <StatCard
          title="Clinics"
          value={stats.clinics.total}
          footer={`Published: ${stats.clinics.published} • Pending: ${stats.clinics.pending} • Rejected: ${stats.clinics.rejected}`}
        />
        <StatCard
          title="Clinic Requests"
          value={stats.requests.total}
          footer={`Pending: ${stats.requests.pending} • Approved: ${stats.requests.approved} • Rejected: ${stats.requests.rejected}`}
        />
        <StatCard
          title="Contacts"
          value={stats.contacts.total}
          footer={`New: ${stats.contacts.new} • Processed: ${stats.contacts.processed}`}
        />

        <StatCard
          title="Reviews"
          value={stats.reviews.total}
          footer={`Pending: ${stats.reviews.pending} • Published: ${stats.reviews.published} • Rejected: ${stats.reviews.rejected} • Avg: ${stats.reviews.avg}`}
        />
        <StatCard
          title="Reports"
          value={stats.reports.total}
          footer={`New: ${stats.reports.new} • In progress: ${stats.reports.inProgress} • Resolved: ${stats.reports.resolved}`}
        />
        <StatCard
          title="Inquiries"
          value={stats.inquiries.total}
          footer={`New: ${stats.inquiries.new} • Resolved: ${stats.inquiries.resolved}`}
        />
        {/* пустая карточка для выравнивания — опционально */}
        <div className="hidden lg:block" />
      </div>

      {/* нижняя зона: графики */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TrendsChart months={months} series={series} />
        <ClinicStatusPie data={statusPie} />
      </div>

      {/* активность */}
      <RecentActivity items={recent} />
    </div>
  );
}
