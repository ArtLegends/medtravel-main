// app/(user)/profile/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";

// ── Types ──
type NotificationRow = {
  id: string;
  type: string;
  data: any;
  is_read: boolean;
  created_at: string;
};

// ── Copy button ──
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={handle} className="inline-flex ml-1 text-default-400 hover:text-primary transition" title="Copy">
      <Icon icon={copied ? "solar:check-circle-bold" : "solar:copy-linear"} width={13} />
    </button>
  );
}

// ── Notification title ──
function notifTitle(type: string): string {
  switch (type) {
    case "booking_confirmed":        return "Booking confirmed";
    case "booking_completed":        return "Treatment completed";
    case "booking_canceled":         return "Booking canceled";
    case "new_booking":              return "New booking request";
    case "new_review":               return "New review received";
    case "new_referral":             return "New patient referral";
    case "new_partner_recruited":    return "New partner recruited";
    case "new_inquiry":              return "New clinic inquiry";
    case "clinic_approved":          return "Clinic approved & published";
    case "clinic_rejected":          return "Clinic application declined";
    case "partner_program_approved": return "Affiliate program approved";
    case "set_password":             return "Set your account password";
    default:                         return "Notification";
  }
}

// ── Full notification body (rendered as JSX for links/copy) ──
function NotifBody({ type, d }: { type: string; d: any }) {
  switch (type) {
    case "partner_program_approved": {
      const program = d.program_key ?? "affiliate";
      const code = d.ref_code as string | undefined;
      const url = d.referral_url as string | undefined;
      return (
        <div className="space-y-1">
          <div>
            Your request for the <span className="font-semibold">{program}</span> affiliate
            program has been approved.
          </div>
          {code && (
            <div className="flex items-center">
              Referral code: <span className="font-mono font-semibold ml-1">{code}</span>
              <CopyBtn text={code} />
            </div>
          )}
          {url && (
            <div className="flex items-start">
              <span className="shrink-0">Referral link:&nbsp;</span>
              <span className="break-all text-primary">{url}</span>
              <CopyBtn text={url} />
            </div>
          )}
        </div>
      );
    }

    case "clinic_approved":
      return (
        <div>
          Congratulations! Your clinic <span className="font-semibold">{d.name || "Your clinic"}</span> has
          been approved and is now published on MedTravel.
        </div>
      );

    case "clinic_rejected":
      return (
        <div>
          Unfortunately, your clinic <span className="font-semibold">{d.name || "your clinic"}</span> application
          was not approved at this time. Please contact our support team for further details.
        </div>
      );

    case "booking_confirmed":
      return (
        <div>
          Your booking for <span className="font-semibold">{d.service_name || "your appointment"}</span> at{" "}
          <span className="font-semibold">{d.clinic_name || "the clinic"}</span> has been confirmed by the clinic.
          {d.scheduled_at && <> Scheduled for: {d.scheduled_at}.</>}
        </div>
      );

    case "booking_completed":
      return (
        <div>
          Your treatment at <span className="font-semibold">{d.clinic_name || "the clinic"}</span> has been
          successfully completed. We hope everything went well!
        </div>
      );

    case "booking_canceled":
      return (
        <div>
          Your booking at <span className="font-semibold">{d.clinic_name || "the clinic"}</span> has been
          canceled. If you have any questions, please contact the clinic directly.
        </div>
      );

    case "new_booking":
      return (
        <div>
          <span className="font-semibold">{d.patient_name || "A new patient"}</span> has submitted a booking
          request for <span className="font-semibold">{d.service_name || "a service"}</span>. Please review it
          in your clinic dashboard.
        </div>
      );

    case "new_review":
      return (
        <div>
          <span className="font-semibold">{d.reviewer_name || "A patient"}</span> has left a new review
          (rated {d.rating || "—"}/10) for <span className="font-semibold">{d.clinic_name || "your clinic"}</span>.
        </div>
      );

    case "new_referral":
      return (
        <div>
          Great news! A new patient has registered through your{" "}
          <span className="font-semibold">{d.program_key || "referral"}</span> program.
          Keep sharing your link!
        </div>
      );

    case "new_partner_recruited":
      return (
        <div>
          A new affiliate partner has joined your network through your recruitment link.
          You will earn commissions from their future referrals.
        </div>
      );

    case "new_inquiry":
      return (
        <div>
          <span className="font-semibold">{d.sender_name || "A potential patient"}</span> has sent a new
          inquiry about <span className="font-semibold">{d.clinic_name || "your clinic"}</span>.
          Please respond as soon as possible.
        </div>
      );

    case "set_password":
      return (
        <div>
          Set a password for your account to enable faster sign-in.
          You signed in via email link.
        </div>
      );

    default:
      return <div>{d?.message || "You have a new notification."}</div>;
  }
}

// ── Action link per notification type ──
function notifActionLink(type: string, d: any): { label: string; href: string } | null {
  switch (type) {
    case "booking_confirmed":
    case "booking_completed":
    case "booking_canceled":
      return { label: "View my bookings", href: "/patient/bookings" };
    case "new_booking":
      return { label: "Review in dashboard", href: "/customer" };
    case "new_review":
      return { label: "View reviews", href: "/customer" };
    case "new_referral":
      return { label: "View referrals", href: "/partner" };
    case "new_partner_recruited":
      return { label: "View partners", href: "/supervisor/partners" };
    case "new_inquiry":
      return { label: "View inquiries", href: "/customer" };
    case "clinic_approved":
      return d.slug ? { label: "Open clinic page", href: `/clinic/${d.slug}` } : null;
    case "clinic_rejected":
      return { label: "Contact support", href: "/contact" };
    case "partner_program_approved":
      return { label: "Go to partner dashboard", href: "/partner" };
    case "set_password":
      return { label: "Go to Settings", href: d.action_url ?? "/settings" };
    default:
      return null;
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
// ── Profile Page ──
// ══════════════════════════════════════════════════════════════

type FormState = {
  firstName: string; lastName: string; secondaryEmail: string;
  timeZone: string; phone: string; preferredLanguage: string; marketingEmails: boolean;
};

export default function ProfilePage() {
  const { supabase, session } = useSupabase() as SupabaseContextType;
  const user = session?.user ?? null;

  const browserTz = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { return ""; }
  }, []);

  const [state, setState] = useState<FormState>({
    firstName: "", lastName: "", secondaryEmail: "",
    timeZone: browserTz, phone: "", preferredLanguage: "en", marketingEmails: true,
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const timeZones = useMemo(() => {
    try { if (typeof Intl.supportedValuesOf === "function") return (Intl as any).supportedValuesOf("timeZone") as string[]; } catch {}
    return ["UTC","Europe/London","Europe/Berlin","Europe/Moscow","Asia/Istanbul","America/New_York","America/Los_Angeles"];
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
      marketingEmails: typeof meta.marketing_emails === "boolean" ? meta.marketing_emails : true,
    }));
  }, [user, browserTz]);

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    setState((prev) => ({ ...prev, [field]: target.type === "checkbox" ? target.checked : target.value }));
    setStatus("idle"); setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setSaving(true); setStatus("idle"); setErrorMsg(null);
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: state.firstName || null, last_name: state.lastName || null,
        secondary_email: state.secondaryEmail || null, time_zone: state.timeZone || null,
        phone: state.phone || null, preferred_language: state.preferredLanguage || null,
        marketing_emails: state.marketingEmails,
      },
    });
    if (error) { setStatus("error"); setErrorMsg(error.message); } else setStatus("saved");
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
        <p className="mt-1 text-sm text-default-500">Manage your personal information and contact preferences.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* ── Left: Profile form ── */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-xl border bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold">Account</h2>
            <p className="text-xs text-default-500">Primary email is used for login and security notifications.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Primary email (read-only)</label>
                <input className="mt-1 w-full rounded-md border px-3 py-2 bg-default-100 text-default-600 cursor-not-allowed" value={user.email ?? ""} disabled />
              </div>
              <div><label className="text-sm text-gray-600">First name</label><input className="mt-1 w-full rounded-md border px-3 py-2" value={state.firstName} onChange={handleChange("firstName")} autoComplete="given-name" /></div>
              <div><label className="text-sm text-gray-600">Last name</label><input className="mt-1 w-full rounded-md border px-3 py-2" value={state.lastName} onChange={handleChange("lastName")} autoComplete="family-name" /></div>
              <div>
                <label className="text-sm text-gray-600">Additional email <span className="text-gray-400">(optional)</span></label>
                <input className="mt-1 w-full rounded-md border px-3 py-2" placeholder="name+medtravel@example.com" value={state.secondaryEmail} onChange={handleChange("secondaryEmail")} autoComplete="email" />
                <p className="mt-1 text-[11px] text-gray-400">Used for notifications and backup contact.</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Time zone</label>
                <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={state.timeZone} onChange={handleChange("timeZone")}>
                  <option value="">Select time zone</option>
                  {timeZones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </select>
                {browserTz && <button type="button" onClick={() => setState((p) => ({ ...p, timeZone: browserTz }))} className="mt-1 text-[11px] text-primary hover:underline">Use browser time zone ({browserTz})</button>}
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold">Contact & preferences</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-sm text-gray-600">Phone / WhatsApp</label><input className="mt-1 w-full rounded-md border px-3 py-2" placeholder="+90 555 000 00 00" value={state.phone} onChange={handleChange("phone")} autoComplete="tel" /></div>
              <div>
                <label className="text-sm text-gray-600">Preferred language</label>
                <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={state.preferredLanguage} onChange={handleChange("preferredLanguage")}>
                  <option value="en">English</option><option value="ru">Russian</option><option value="pl">Polish</option>
                </select>
              </div>
            </div>
            <div className="mt-2 flex items-start gap-2">
              <input id="marketingEmails" type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-400" checked={state.marketingEmails} onChange={handleChange("marketingEmails")} />
              <label htmlFor="marketingEmails" className="text-sm text-gray-700">Receive product updates and important news about MedTravel<span className="block text-[11px] text-gray-400">No spam — only essential updates a few times per year.</span></label>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
            {status === "saved" && <span className="text-xs text-emerald-600">Profile updated.</span>}
            {status === "error" && errorMsg && <span className="text-xs text-red-600">{errorMsg}</span>}
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
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const loadNotifications = async (offset = 0, append = false) => {
    if (!supabase || !session) return;
    if (!append) setLoading(true);
    let query = supabase.from("notifications").select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    if (filter === "unread") query = query.eq("is_read", false);
    const { data } = await query;
    const rows = (data ?? []) as NotificationRow[];
    setItems((prev) => (append ? [...prev, ...rows] : rows));
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  };

  useEffect(() => { setItems([]); loadNotifications(0, false); }, [supabase, session, filter]);

  const markAllRead = async () => {
    if (!supabase || !session) return;
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", session.user.id).eq("is_read", false);
  };

  const markOneRead = async (id: string) => {
    if (!supabase) return;
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <div className="lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-xl border bg-white">
        {/* Header */}
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </h2>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline font-medium">
                Mark all read
              </button>
            )}
          </div>
          <div className="flex gap-1 mt-2">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  filter === f ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {f === "all" ? "All" : "Unread"}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="max-h-[55vh] overflow-y-auto divide-y divide-gray-100">
          {loading && items.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-gray-400">Loading…</div>
          )}
          {!loading && items.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-gray-500">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </div>
          )}

          {items.map((n) => {
            const action = notifActionLink(n.type, n.data);
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markOneRead(n.id)}
                className={`px-4 py-3 transition cursor-pointer ${
                  !n.is_read ? "bg-blue-50/30 hover:bg-blue-50/50" : "hover:bg-gray-50"
                }`}
              >
                {/* Title row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {!n.is_read && (
                      <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    )}
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {notifTitle(n.type)}
                    </span>
                  </div>
                  <span className="shrink-0 text-[11px] text-gray-400 whitespace-nowrap">
                    {timeAgo(n.created_at)}
                  </span>
                </div>

                {/* Full body text */}
                <div className="mt-1 text-xs text-gray-600 break-words">
                  <NotifBody type={n.type} d={n.data} />
                </div>

                {/* Action link */}
                {action && (
                  <div className="mt-1.5">
                    <a
                      href={action.href}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      {action.label}
                      <Icon icon="solar:arrow-right-linear" width={12} />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="border-t px-4 py-2.5 text-center">
            <button
              onClick={() => loadNotifications(items.length, true)}
              disabled={loading}
              className="text-sm text-primary hover:underline font-medium disabled:opacity-50"
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}