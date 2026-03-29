// components/notifications/NotificationsBell.tsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { useSupabase } from "@/lib/supabase/supabase-provider";
import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";

type NotificationRow = {
  id: string;
  type: string;
  data: any;
  is_read: boolean;
  created_at: string;
};

// ── Notification type config ──
const NOTIF_CONFIG: Record<
  string,
  { icon: string; color: string; title: (d: any) => string; body?: (d: any) => string }
> = {
  booking_confirmed: {
    icon: "solar:check-circle-bold",
    color: "text-emerald-600",
    title: (d) => `Booking confirmed`,
    body: (d) => `${d.service_name || "Your appointment"} at ${d.clinic_name || "clinic"} has been confirmed.`,
  },
  booking_completed: {
    icon: "solar:verified-check-bold",
    color: "text-blue-600",
    title: () => `Treatment completed`,
    body: (d) => `Your treatment at ${d.clinic_name || "clinic"} has been marked as completed.`,
  },
  booking_canceled: {
    icon: "solar:close-circle-bold",
    color: "text-red-500",
    title: () => `Booking canceled`,
    body: (d) => `Your booking at ${d.clinic_name || "clinic"} has been canceled.`,
  },
  new_booking: {
    icon: "solar:calendar-add-bold",
    color: "text-blue-600",
    title: () => `New booking received`,
    body: (d) => `${d.patient_name || "A patient"} booked ${d.service_name || "a service"}.`,
  },
  new_review: {
    icon: "solar:star-bold",
    color: "text-amber-500",
    title: () => `New review`,
    body: (d) => `${d.reviewer_name || "Someone"} left a ${d.rating || ""}/10 review for ${d.clinic_name || "your clinic"}.`,
  },
  new_referral: {
    icon: "solar:user-plus-bold",
    color: "text-emerald-600",
    title: () => `New referral`,
    body: (d) => `A new patient signed up via your referral link${d.program_key ? ` (${d.program_key})` : ""}.`,
  },
  new_partner_recruited: {
    icon: "solar:users-group-two-rounded-bold",
    color: "text-purple-600",
    title: () => `New partner recruited`,
    body: () => `A new partner registered through your recruitment link.`,
  },
  new_inquiry: {
    icon: "solar:letter-bold",
    color: "text-sky-600",
    title: () => `New inquiry`,
    body: (d) => `${d.sender_name || "Someone"} sent an inquiry about ${d.clinic_name || "your clinic"}.`,
  },
  clinic_approved: {
    icon: "solar:shield-check-bold",
    color: "text-emerald-600",
    title: () => `Clinic approved`,
    body: (d) => `${d.name || "Your clinic"} has been published on MedTravel.`,
  },
  clinic_rejected: {
    icon: "solar:shield-cross-bold",
    color: "text-red-500",
    title: () => `Clinic not approved`,
    body: (d) => `${d.name || "Your clinic"} application was not approved.`,
  },
  partner_program_approved: {
    icon: "solar:verified-check-bold",
    color: "text-emerald-600",
    title: (d) => `Program approved`,
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
    title: () => `Set your password`,
    body: () => `Set a password in Settings for faster sign-in.`,
  },
};

const BELL_LIMIT = 5;

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

export default function NotificationsBell() {
  const { supabase, session } = useSupabase() as SupabaseContextType;
  const router = useRouter();

  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (!session) return null;

  const loadNotifications = useCallback(async () => {
    if (!supabase || !session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(BELL_LIMIT);

    if (!error && data) setItems(data as NotificationRow[]);
    setLoading(false);
  }, [supabase, session]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const markAllRead = useCallback(async () => {
    if (!supabase || !session || unreadCount === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);
  }, [supabase, session, unreadCount]);

  const handleBellClick = () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) markAllRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleBellClick}
        className="relative rounded-md p-1.5 text-default-500 hover:text-default-700 transition"
        aria-label="Notifications"
      >
        <Icon icon="solar:bell-linear" width={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[360px] max-w-[calc(100vw-32px)] rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold text-gray-900">
              Notifications
            </span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                aria-label="Close notifications"
              >
                <Icon icon="solar:close-circle-linear" width={18} />
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="max-h-[380px] overflow-y-auto">
            {loading && items.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                Loading…
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="px-4 py-8 text-center">
                <Icon
                  icon="solar:bell-off-linear"
                  width={32}
                  className="mx-auto text-gray-300 mb-2"
                />
                <div className="text-sm text-gray-500">
                  No notifications yet
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
                  className={`flex gap-3 px-4 py-3 border-b last:border-0 transition ${
                    !n.is_read ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
                    <Icon icon={cfg.icon} width={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {cfg.title(n.data)}
                    </div>
                    {cfg.body && (
                      <div className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                        {cfg.body(n.data)}
                      </div>
                    )}
                    <div className="mt-1 text-[11px] text-gray-400">
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

          {/* Footer */}
          <div className="border-t px-4 py-2.5">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/profile?tab=notifications");
              }}
              className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}