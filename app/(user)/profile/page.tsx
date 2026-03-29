// app/(user)/profile/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";

// ── Tabs ──
const TABS = [
  { key: "profile", label: "Profile", icon: "solar:user-circle-linear" },
  { key: "notifications", label: "Notifications", icon: "solar:bell-linear" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as TabKey | null;
  const [activeTab, setActiveTab] = useState<TabKey>(
    tabParam === "notifications" ? "notifications" : "profile"
  );

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    const url = tab === "profile" ? "/profile" : `/profile?tab=${tab}`;
    router.replace(url, { scroll: false });
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">My Account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your profile and notifications
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar tabs */}
        <nav className="md:w-[200px] shrink-0">
          <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {TABS.map((tab) => (
              <li key={tab.key}>
                <button
                  onClick={() => switchTab(tab.key)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition whitespace-nowrap w-full text-left ${
                    activeTab === tab.key
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon icon={tab.icon} width={16} />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && <ProfileForm />}
          {activeTab === "notifications" && <NotificationsPanel />}
        </div>
      </div>
    </main>
  );
}

// ══════════════════════════════════════════════════════════════
// ── Profile Form (extracted from old page) ──
// ══════════════════════════════════════════════════════════════

type FormState = {
  firstName: string;
  lastName: string;
  secondaryEmail: string;
  timeZone: string;
  phone: string;
  preferredLanguage: string;
  marketingEmails: boolean;
};

function ProfileForm() {
  const { supabase, session } = useSupabase() as SupabaseContextType;
  const user = session?.user ?? null;

  const browserTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch {
      return "";
    }
  }, []);

  const [state, setState] = useState<FormState>({
    firstName: "",
    lastName: "",
    secondaryEmail: "",
    timeZone: browserTz,
    phone: "",
    preferredLanguage: "en",
    marketingEmails: true,
  });

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const timeZones = useMemo(() => {
    try {
      if (typeof Intl.supportedValuesOf === "function") {
        return (Intl as any).supportedValuesOf("timeZone") as string[];
      }
    } catch {}
    return [
      "UTC", "Europe/London", "Europe/Berlin", "Europe/Moscow",
      "Asia/Istanbul", "America/New_York", "America/Los_Angeles",
    ];
  }, []);

  useEffect(() => {
    if (!user) return;
    const meta: any = user.user_metadata ?? {};
    setState((prev) => ({
      ...prev,
      firstName: meta.first_name ?? meta.given_name ?? "",
      lastName: meta.last_name ?? meta.family_name ?? "",
      secondaryEmail: meta.secondary_email ?? "",
      timeZone: meta.time_zone ?? prev.timeZone ?? browserTz,
      phone: meta.phone ?? "",
      preferredLanguage: meta.preferred_language ?? "en",
      marketingEmails:
        typeof meta.marketing_emails === "boolean" ? meta.marketing_emails : true,
    }));
  }, [user, browserTz]);

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = e.target as HTMLInputElement;
      const value = target.type === "checkbox" ? target.checked : target.value;
      setState((prev) => ({ ...prev, [field]: value as any }));
      setStatus("idle");
      setErrorMsg(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    setSaving(true);
    setStatus("idle");
    setErrorMsg(null);

    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: state.firstName || null,
        last_name: state.lastName || null,
        secondary_email: state.secondaryEmail || null,
        time_zone: state.timeZone || null,
        phone: state.phone || null,
        preferred_language: state.preferredLanguage || null,
        marketing_emails: state.marketingEmails,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message || "Failed to update profile");
    } else {
      setStatus("saved");
    }
    setSaving(false);
  };

  if (!user) {
    return <p className="text-gray-500">Please sign in to manage your profile.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account */}
      <section className="rounded-xl border bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="text-xs text-gray-500">
          Primary email is used for login and security notifications.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Primary email (read-only)</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
              value={user.email ?? ""}
              disabled
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">First name</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={state.firstName}
              onChange={handleChange("firstName")}
              autoComplete="given-name"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Last name</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={state.lastName}
              onChange={handleChange("lastName")}
              autoComplete="family-name"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">
              Additional email <span className="text-gray-400">(optional)</span>
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="name+medtravel@example.com"
              value={state.secondaryEmail}
              onChange={handleChange("secondaryEmail")}
              autoComplete="email"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Used for notifications and backup contact.
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Time zone</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={state.timeZone}
              onChange={handleChange("timeZone")}
            >
              <option value="">Select time zone</option>
              {timeZones.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            {browserTz && (
              <button
                type="button"
                onClick={() => setState((prev) => ({ ...prev, timeZone: browserTz }))}
                className="mt-1 text-[11px] text-blue-600 hover:underline"
              >
                Use browser time zone ({browserTz})
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-xl border bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold">Contact & preferences</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-gray-600">Phone / WhatsApp</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="+90 555 000 00 00"
              value={state.phone}
              onChange={handleChange("phone")}
              autoComplete="tel"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Preferred language</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={state.preferredLanguage}
              onChange={handleChange("preferredLanguage")}
            >
              <option value="en">English</option>
              <option value="ru">Russian</option>
              <option value="pl">Polish</option>
            </select>
          </div>
        </div>
        <div className="mt-2 flex items-start gap-2">
          <input
            id="marketingEmails"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-400"
            checked={state.marketingEmails}
            onChange={handleChange("marketingEmails")}
          />
          <label htmlFor="marketingEmails" className="text-sm text-gray-700">
            Receive product updates and important news
            <span className="block text-[11px] text-gray-400">
              No spam — only essential updates.
            </span>
          </label>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {status === "saved" && <span className="text-xs text-emerald-600">Profile updated.</span>}
        {status === "error" && errorMsg && <span className="text-xs text-red-600">{errorMsg}</span>}
      </div>
    </form>
  );
}

// ══════════════════════════════════════════════════════════════
// ── Notifications Panel ──
// ══════════════════════════════════════════════════════════════

type NotificationRow = {
  id: string;
  type: string;
  data: any;
  is_read: boolean;
  created_at: string;
};

const NOTIF_CONFIG: Record<
  string,
  { icon: string; color: string; title: (d: any) => string; body?: (d: any) => string }
> = {
  booking_confirmed: {
    icon: "solar:check-circle-bold",
    color: "text-emerald-600",
    title: () => "Booking confirmed",
    body: (d) => `${d.service_name || "Your appointment"} at ${d.clinic_name || "clinic"} has been confirmed.`,
  },
  booking_completed: {
    icon: "solar:verified-check-bold",
    color: "text-blue-600",
    title: () => "Treatment completed",
    body: (d) => `Your treatment at ${d.clinic_name || "clinic"} has been marked as completed.`,
  },
  booking_canceled: {
    icon: "solar:close-circle-bold",
    color: "text-red-500",
    title: () => "Booking canceled",
    body: (d) => `Your booking at ${d.clinic_name || "clinic"} has been canceled.`,
  },
  new_booking: {
    icon: "solar:calendar-add-bold",
    color: "text-blue-600",
    title: () => "New booking received",
    body: (d) => `${d.patient_name || "A patient"} booked ${d.service_name || "a service"}.`,
  },
  new_review: {
    icon: "solar:star-bold",
    color: "text-amber-500",
    title: () => "New review",
    body: (d) => `${d.reviewer_name || "Someone"} left a ${d.rating || ""}/10 review for ${d.clinic_name || "your clinic"}.`,
  },
  new_referral: {
    icon: "solar:user-plus-bold",
    color: "text-emerald-600",
    title: () => "New referral",
    body: (d) => `A new patient signed up via your referral link${d.program_key ? ` (${d.program_key})` : ""}.`,
  },
  new_partner_recruited: {
    icon: "solar:users-group-two-rounded-bold",
    color: "text-purple-600",
    title: () => "New partner recruited",
    body: () => "A new partner registered through your recruitment link.",
  },
  new_inquiry: {
    icon: "solar:letter-bold",
    color: "text-sky-600",
    title: () => "New inquiry",
    body: (d) => `${d.sender_name || "Someone"} sent an inquiry about ${d.clinic_name || "your clinic"}.`,
  },
  clinic_approved: {
    icon: "solar:shield-check-bold",
    color: "text-emerald-600",
    title: () => "Clinic approved",
    body: (d) => `${d.name || "Your clinic"} has been published on MedTravel.`,
  },
  clinic_rejected: {
    icon: "solar:shield-cross-bold",
    color: "text-red-500",
    title: () => "Clinic not approved",
    body: (d) => `${d.name || "Your clinic"} application was not approved.`,
  },
  partner_program_approved: {
    icon: "solar:verified-check-bold",
    color: "text-emerald-600",
    title: () => "Program approved",
    body: (d) => {
      const parts: string[] = [];
      parts.push(`Your request for ${d.program_key || "program"} has been approved.`);
      if (d.ref_code) parts.push(`Code: ${d.ref_code}`);
      return parts.join(" ");
    },
  },
  set_password: {
    icon: "solar:lock-keyhole-bold",
    color: "text-amber-600",
    title: () => "Set your password",
    body: () => "Set a password in Settings for faster sign-in.",
  },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const PAGE_SIZE = 20;

function NotificationsPanel() {
  const { supabase, session } = useSupabase() as SupabaseContextType;
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const loadNotifications = async (offset = 0, append = false) => {
    if (!supabase || !session) return;
    setLoading(true);

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (filter === "unread") {
      query = query.eq("is_read", false);
    }

    const { data } = await query;
    const rows = (data ?? []) as NotificationRow[];

    setItems((prev) => (append ? [...prev, ...rows] : rows));
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications(0, false);
  }, [supabase, session, filter]);

  const markAllRead = async () => {
    if (!supabase || !session) return;
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);
  };

  const markOneRead = async (id: string) => {
    if (!supabase) return;
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex rounded-lg border overflow-hidden text-sm">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 transition ${
                filter === "all"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 transition ${
                filter === "unread"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Unread
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border bg-white divide-y">
        {loading && items.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-gray-400">
            Loading notifications…
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="px-4 py-12 text-center">
            <Icon
              icon="solar:bell-off-linear"
              width={40}
              className="mx-auto text-gray-300 mb-3"
            />
            <div className="text-sm text-gray-500">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </div>
          </div>
        )}

        {items.map((n) => {
          const cfg = NOTIF_CONFIG[n.type] ?? {
            icon: "solar:info-circle-bold",
            color: "text-gray-500",
            title: () => "Notification",
            body: (d: any) => d?.message || "",
          };

          return (
            <div
              key={n.id}
              onClick={() => !n.is_read && markOneRead(n.id)}
              className={`flex gap-3 px-4 py-3.5 transition cursor-pointer ${
                !n.is_read ? "bg-blue-50/40 hover:bg-blue-50/60" : "hover:bg-gray-50"
              }`}
            >
              <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
                <Icon icon={cfg.icon} width={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {cfg.title(n.data)}
                </div>
                {cfg.body && (
                  <div className="mt-0.5 text-sm text-gray-500">
                    {cfg.body(n.data)}
                  </div>
                )}
                <div className="mt-1.5 text-xs text-gray-400">
                  {timeAgo(n.created_at)}
                </div>
              </div>
              {!n.is_read && (
                <div className="mt-2 shrink-0">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="text-center pt-2">
          <button
            onClick={() => loadNotifications(items.length, true)}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}