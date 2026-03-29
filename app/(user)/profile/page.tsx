// app/(user)/profile/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";

// ── Notification helpers (shared with bell) ──
type NotificationRow = {
  id: string;
  type: string;
  data: any;
  is_read: boolean;
  created_at: string;
};

function notifTitle(type: string, d: any): string {
  switch (type) {
    case "booking_confirmed": return "Booking confirmed";
    case "booking_completed": return "Treatment completed";
    case "booking_canceled": return "Booking canceled";
    case "new_booking": return "New booking received";
    case "new_review": return "New review received";
    case "new_referral": return "New referral";
    case "new_partner_recruited": return "New partner recruited";
    case "new_inquiry": return "New clinic inquiry";
    case "clinic_approved": return "Clinic published";
    case "clinic_rejected": return "Clinic not approved";
    case "partner_program_approved": return "Program approved";
    case "set_password": return "Set your password";
    default: return "Notification";
  }
}

function notifBody(type: string, d: any): string {
  switch (type) {
    case "booking_confirmed":
      return `${d.service_name || "Appointment"} at ${d.clinic_name || "clinic"}`;
    case "booking_completed":
      return `Treatment at ${d.clinic_name || "clinic"} completed`;
    case "booking_canceled":
      return `Booking at ${d.clinic_name || "clinic"} was canceled`;
    case "new_booking":
      return `${d.patient_name || "Patient"} — ${d.service_name || "service"}`;
    case "new_review":
      return `${d.reviewer_name || "Someone"} rated ${d.clinic_name || "clinic"} ${d.rating || ""}/10`;
    case "new_referral":
      return `New patient via ${d.program_key || "referral"} program`;
    case "new_partner_recruited":
      return "A new partner joined your network";
    case "new_inquiry":
      return `${d.sender_name || "Someone"} — ${d.clinic_name || "clinic"}`;
    case "clinic_approved":
      return `${d.name || "Your clinic"} is now live on MedTravel`;
    case "clinic_rejected":
      return `${d.name || "Your clinic"} was not approved`;
    case "partner_program_approved": {
      let text = `${d.program_key || "Program"} approved`;
      if (d.ref_code) text += `. Code: ${d.ref_code}`;
      return text;
    }
    case "set_password":
      return "Set a password for faster sign-in";
    default:
      return d?.message || "";
  }
}

function timeAgo(dateStr: string): string {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ══════════════════════════════════════════════════════════════
// ── Main Profile Page ──
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

export default function ProfilePage() {
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
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Profile</h1>
        <p className="text-default-500">Please sign in to manage your profile.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">My profile</h1>
        <p className="mt-1 text-sm text-default-500">
          Manage your personal information and contact preferences.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* ── Left: Profile form ── */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Account info */}
          <section className="rounded-xl border bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold">Account</h2>
            <p className="text-xs text-default-500">
              Primary email is used for login and security notifications.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Primary email (read-only)</label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 bg-default-100 text-default-600 cursor-not-allowed"
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
                    className="mt-1 text-[11px] text-primary hover:underline"
                  >
                    Use browser time zone ({browserTz})
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Contact & preferences */}
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
                Receive product updates and important news about MedTravel
                <span className="block text-[11px] text-gray-400">
                  No spam — only essential updates a few times per year.
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
            {status === "error" && errorMsg && (
              <span className="text-xs text-red-600">{errorMsg}</span>
            )}
          </div>
        </form>

        {/* ── Right: Notifications sidebar ── */}
        <NotificationsSidebar />
      </div>
    </main>
  );
}

// ══════════════════════════════════════════════════════════════
// ── Notifications Sidebar ──
// ══════════════════════════════════════════════════════════════

const PAGE_SIZE = 20;

function NotificationsSidebar() {
  const { supabase, session } = useSupabase() as SupabaseContextType;
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const loadNotifications = async (offset = 0, append = false) => {
    if (!supabase || !session) return;
    if (!append) setLoading(true);

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    const rows = (data ?? []) as NotificationRow[];
    setItems((prev) => (append ? [...prev, ...rows] : rows));
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications(0, false);
  }, [supabase, session]);

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
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <div className="lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-xl border bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </h2>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
          {loading && items.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-gray-400">
              Loading…
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          )}

          {items.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markOneRead(n.id)}
              className={`px-4 py-3 cursor-pointer transition ${
                !n.is_read ? "bg-blue-50/30 hover:bg-blue-50/50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {!n.is_read && (
                      <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    )}
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {notifTitle(n.type, n.data)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 line-clamp-2 break-words">
                    {notifBody(n.type, n.data)}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-gray-400 mt-0.5 whitespace-nowrap">
                  {timeAgo(n.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="border-t px-4 py-2.5 text-center">
            <button
              onClick={() => loadNotifications(items.length, true)}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}