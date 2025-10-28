// app/(admin)/admin/page.tsx
import StatCard from "@/components/dashboard/StatCard";
import TrendsChart from "@/components/dashboard/TrendsChart";
import ClinicStatusPie from "@/components/dashboard/ClinicStatusPie";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { createServerClient } from "@/lib/supabase/serverClient";

// поправь под свои значения, если они отличаются в БД
const BOOKING_NEW = ["new"];
const BOOKING_DONE = ["processed", "done"];
const BOOKING_REJECTED = ["rejected"];

const CLINIC_PUBLISHED = { is_published: true, moderation_status: "approved" };
const CLINIC_PENDING = { moderation_status: "pending" };
const CLINIC_REJECTED = { moderation_status: "rejected" };

// у "старых" запросов клиник
const REQUEST_PENDING = ["pending", "new"];
const REQUEST_APPROVED = ["approved"];
const REQUEST_REJECTED = ["rejected"];

// для recent activity возьмём по нескольку последних записей из разных таблиц
const RECENT_LIMIT = 5;

export const metadata = {
  title: "Admin — Dashboard | MedTravel",
};

export default async function Page() {
  const sb = await createServerClient();

  /** ====== Верхние карточки со счётчиками ====== */
  const [
    // bookings
    bkTotal,
    bkNew,
    bkProcessed,
    bkRejected,

    // clinics
    clTotal,
    clPublished,
    clPending,
    clRejected,

    // clinic requests (старые)
    crTotal,
    crPending,
    crApproved,
    crRejected,

    // contacts
    cntTotal,
    cntNew,
    cntProcessed,

    // reviews (и средняя оценка)
    rvTotal,
    rvPending,
    rvPublished,
    rvRejected,
    rvRatings,

    // reports
    rpTotal,
    rpNew,
    rpInProgress,
    rpResolved,

    // inquiries
    iqTotal,
    iqNew,
    iqResolved,
  ] = await Promise.all([
    // bookings
    sb.from("bookings").select("*", { count: "exact", head: true }),
    sb.from("bookings").select("*", { count: "exact", head: true }).in("status", BOOKING_NEW),
    sb.from("bookings").select("*", { count: "exact", head: true }).in("status", BOOKING_DONE),
    sb.from("bookings").select("*", { count: "exact", head: true }).in("status", BOOKING_REJECTED),

    // clinics
    sb.from("clinics").select("*", { count: "exact", head: true }),
    sb.from("clinics").select("*", { count: "exact", head: true })
      .eq("is_published", CLINIC_PUBLISHED.is_published)
      .eq("moderation_status", CLINIC_PUBLISHED.moderation_status),
    sb.from("clinics").select("*", { count: "exact", head: true })
      .eq("moderation_status", CLINIC_PENDING.moderation_status),
    sb.from("clinics").select("*", { count: "exact", head: true })
      .eq("moderation_status", CLINIC_REJECTED.moderation_status),

    // clinic_requests (legacy)
    sb.from("clinic_requests").select("*", { count: "exact", head: true }),
    sb.from("clinic_requests").select("*", { count: "exact", head: true }).in("status", REQUEST_PENDING),
    sb.from("clinic_requests").select("*", { count: "exact", head: true }).in("status", REQUEST_APPROVED),
    sb.from("clinic_requests").select("*", { count: "exact", head: true }).in("status", REQUEST_REJECTED),

    // contact messages
    sb.from("contact_messages").select("*", { count: "exact", head: true }),
    sb.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "new"),
    sb.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "processed"),

    // reviews (+ ratings для среднего)
    sb.from("reviews").select("*", { count: "exact", head: true }),
    sb.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("reviews").select("*", { count: "exact", head: true }).eq("status", "published"),
    sb.from("reviews").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    sb.from("reviews").select("rating, created_at").order("created_at", { ascending: false }).limit(500),

    // reports
    sb.from("reports").select("*", { count: "exact", head: true }),
    sb.from("reports").select("*", { count: "exact", head: true }).eq("status", "new"),
    sb.from("reports").select("*", { count: "exact", head: true }).in("status", ["in_progress", "processing"]),
    sb.from("reports").select("*", { count: "exact", head: true }).eq("status", "resolved"),

    // clinic inquiries
    sb.from("clinic_inquiries").select("*", { count: "exact", head: true }),
    sb.from("clinic_inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
    sb.from("clinic_inquiries").select("*", { count: "exact", head: true }).eq("status", "resolved"),
  ]);

  const stats = {
    bookings: {
      total: bkTotal.count ?? 0,
      new: bkNew.count ?? 0,
      processed: bkProcessed.count ?? 0,
      rejected: bkRejected.count ?? 0,
    },
    clinics: {
      total: clTotal.count ?? 0,
      published: clPublished.count ?? 0,
      pending: clPending.count ?? 0,
      rejected: clRejected.count ?? 0,
    },
    requests: {
      total: crTotal.count ?? 0,
      pending: crPending.count ?? 0,
      approved: crApproved.count ?? 0,
      rejected: crRejected.count ?? 0,
    },
    contacts: {
      total: cntTotal.count ?? 0,
      new: cntNew.count ?? 0,
      processed: cntProcessed.count ?? 0,
    },
    reviews: {
      total: rvTotal.count ?? 0,
      pending: rvPending.count ?? 0,
      published: rvPublished.count ?? 0,
      rejected: rvRejected.count ?? 0,
      avg: (() => {
        const arr = (rvRatings.data as any[] | null) ?? [];
        if (!arr.length) return 0;
        const nums = arr.map((r) => Number(r.rating)).filter((n) => Number.isFinite(n));
        if (!nums.length) return 0;
        return +(nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(1);
      })(),
    },
    reports: {
      total: rpTotal.count ?? 0,
      new: rpNew.count ?? 0,
      inProgress: rpInProgress.count ?? 0,
      resolved: rpResolved.count ?? 0,
    },
    inquiries: {
      total: iqTotal.count ?? 0,
      new: iqNew.count ?? 0,
      resolved: iqResolved.count ?? 0,
    },
  };

  /** ====== Trends: бронирования за 6 месяцев по статусам ====== */
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1); // включительно, 6 месяцев
  const { data: lastBookings } = await sb
    .from("bookings")
    .select("created_at, status")
    .gte("created_at", from.toISOString())
    .order("created_at", { ascending: true });

  const monthsLabels: string[] = [];
  const monthKey = (d: Date) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  const monthsKeys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthsLabels.push(d.toLocaleString("en", { month: "short" }));
    monthsKeys.push(monthKey(d));
  }

  const bucket = Object.fromEntries(monthsKeys.map((k) => [k, { new: 0, processed: 0, rejected: 0 }]));
  (lastBookings ?? []).forEach((r: any) => {
    const d = new Date(r.created_at);
    const k = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
    if (!bucket[k]) return;
    if (BOOKING_NEW.includes(r.status)) bucket[k].new++;
    else if (BOOKING_DONE.includes(r.status)) bucket[k].processed++;
    else if (BOOKING_REJECTED.includes(r.status)) bucket[k].rejected++;
  });

  const series = [
    { label: "New",       color: "#6366f1", values: monthsKeys.map((k) => bucket[k].new) },
    { label: "Processed", color: "#22c55e", values: monthsKeys.map((k) => bucket[k].processed) },
    { label: "Rejected",  color: "#ef4444", values: monthsKeys.map((k) => bucket[k].rejected) },
  ];

  /** ====== Pie: статусы клиник ====== */
  const statusPie = [
    { label: "Published", color: "#16a34a", value: stats.clinics.published },
    { label: "Pending",   color: "#f59e0b", value: stats.clinics.pending },
    { label: "Rejected",  color: "#ef4444", value: stats.clinics.rejected },
  ];

  /** ====== Recent activity: небольшая лента ====== */
  const [
    recentBookings,
    recentClinics,
    recentReports,
    recentReviews,
    recentInquiries,
  ] = await Promise.all([
    sb.from("bookings").select("name, status, created_at").order("created_at", { ascending: false }).limit(RECENT_LIMIT),
    sb.from("clinics").select("name, moderation_status, is_published, created_at").order("created_at", { ascending: false }).limit(RECENT_LIMIT),
    sb.from("reports").select("title, status, created_at").order("created_at", { ascending: false }).limit(RECENT_LIMIT),
    sb.from("reviews").select("title, status, created_at").order("created_at", { ascending: false }).limit(RECENT_LIMIT),
    sb.from("clinic_inquiries").select("subject, status, created_at").order("created_at", { ascending: false }).limit(RECENT_LIMIT),
  ]);

  const recent = [
    ...((recentBookings.data as any[]) ?? []).map((r) => ({
      type: "Booking",
      event: `New booking — ${r.name ?? "—"}`,
      time: new Date(r.created_at).toLocaleString(),
      status: r.status ?? "new",
    })),
    ...((recentClinics.data as any[]) ?? []).map((r) => ({
      type: "Clinic",
      event: r.is_published || r.moderation_status === "approved"
        ? `Clinic Published — ${r.name ?? "—"}`
        : `Clinic ${r.moderation_status ?? "updated"} — ${r.name ?? "—"}`,
      time: new Date(r.created_at).toLocaleString(),
      status: r.moderation_status ?? (r.is_published ? "published" : "pending"),
    })),
    ...((recentReports.data as any[]) ?? []).map((r) => ({
      type: "Report",
      event: r.title ?? "Report updated",
      time: new Date(r.created_at).toLocaleString(),
      status: r.status ?? "new",
    })),
    ...((recentReviews.data as any[]) ?? []).map((r) => ({
      type: "Review",
      event: r.title ?? "Review submitted",
      time: new Date(r.created_at).toLocaleString(),
      status: r.status ?? "pending",
    })),
    ...((recentInquiries.data as any[]) ?? []).map((r) => ({
      type: "Inquiry",
      event: r.subject ?? "New inquiry",
      time: new Date(r.created_at).toLocaleString(),
      status: r.status ?? "new",
    })),
  ]
    .sort((a, b) => +new Date(b.time) - +new Date(a.time))
    .slice(0, RECENT_LIMIT); // ограничим общую ленту

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
        <div className="hidden lg:block" />
      </div>

      {/* графики */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TrendsChart months={monthsLabels} series={series} />
        <ClinicStatusPie data={statusPie} />
      </div>

      {/* активность */}
      <RecentActivity items={recent} />
    </div>
  );
}
