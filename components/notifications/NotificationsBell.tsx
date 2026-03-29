// components/notifications/NotificationsBell.tsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";
import { Badge, Button } from "@heroui/react";
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

// ── Short, clear notification text per type ──
function notifTitle(type: string, d: any): string {
  switch (type) {
    case "booking_confirmed":
      return "Booking confirmed";
    case "booking_completed":
      return "Treatment completed";
    case "booking_canceled":
      return "Booking canceled";
    case "new_booking":
      return "New booking received";
    case "new_review":
      return "New review received";
    case "new_referral":
      return "New referral";
    case "new_partner_recruited":
      return "New partner recruited";
    case "new_inquiry":
      return "New clinic inquiry";
    case "clinic_approved":
      return "Clinic published";
    case "clinic_rejected":
      return "Clinic not approved";
    case "partner_program_approved":
      return "Program approved";
    case "set_password":
      return "Set your password";
    default:
      return "Notification";
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
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

const BELL_LIMIT = 5;

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
      {/* Bell button — keeps HeroUI Button with border */}
      <Button
        className="h-8 w-8 min-w-0 p-0"
        size="sm"
        variant="ghost"
        onPress={handleBellClick}
      >
        <Badge
          color={unreadCount > 0 ? "danger" : "default"}
          content={unreadCount > 0 ? String(Math.min(unreadCount, 9)) : ""}
          isInvisible={unreadCount === 0}
          placement="top-right"
          shape="circle"
          size="sm"
        >
          <Icon className="text-default-500" icon="solar:bell-linear" width={22} />
        </Badge>
      </Button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[340px] max-w-[calc(100vw-32px)] rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <span className="text-sm font-semibold text-gray-900">
              Notifications
            </span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close"
            >
              <Icon icon="solar:close-circle-linear" width={18} />
            </button>
          </div>

          {/* Items */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">
            {loading && items.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                Loading…
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No notifications yet
              </div>
            )}

            {items.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 ${!n.is_read ? "bg-blue-50/30" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {notifTitle(n.type, n.data)}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500 line-clamp-2 break-words">
                      {notifBody(n.type, n.data)}
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] text-gray-400 mt-0.5">
                    {timeAgo(n.created_at)}
                  </span>
                </div>
              </div>
            ))}
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