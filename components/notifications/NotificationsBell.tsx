// components/notifications/NotificationsBell.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Button,
} from "@heroui/react";
import { useRouter } from "next/navigation";

import { useSupabase } from "@/lib/supabase/supabase-provider";
import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";
import { clinicHref } from "@/lib/clinic-url";

type NotificationRow = {
  id: string;
  type: string;
  data: any;
  is_read: boolean;
  created_at: string;
};

const BELL_LIMIT = 5;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center ml-1 text-default-400 hover:text-primary transition"
      title="Copy to clipboard"
    >
      <Icon icon={copied ? "solar:check-circle-bold" : "solar:copy-linear"} width={13} />
    </button>
  );
}

function renderNotification(n: NotificationRow) {
  const d = n.data ?? {};

  switch (n.type) {
    case "partner_program_approved": {
      const program = d.program_key ?? "program";
      const code = d.ref_code as string | undefined;
      const url = d.referral_url as string | undefined;
      return (
        <div className="space-y-1 text-left">
          <div className="text-sm font-medium">
            Your request for the{" "}
            <span className="font-semibold">{program}</span> affiliate
            program has been approved.
          </div>
          {code && (
            <div className="text-xs text-default-500 flex items-center">
              Referral code:{" "}
              <span className="font-mono font-semibold ml-1">{code}</span>
              <CopyButton text={code} />
            </div>
          )}
          {url && (
            <div className="text-xs text-default-500 flex items-center">
              Referral link
              <CopyButton text={url} />
            </div>
          )}
        </div>
      );
    }

    case "clinic_approved": {
      const clinicName = d.name ?? "your clinic";
      let clinicUrl: string | null = null;
      try {
        if (d.slug) clinicUrl = clinicHref({ slug: d.slug, country: d.country, province: d.province, city: d.city, district: d.district });
      } catch { clinicUrl = null; }
      return (
        <div className="space-y-1 text-left">
          <div className="text-sm font-medium">
            Congratulations! Your clinic <span className="font-semibold">{clinicName}</span> has
            been approved and is now published on MedTravel.
          </div>
          {clinicUrl && (
            <div className="text-xs text-default-500">
              <a href={clinicUrl} target="_blank" rel="noreferrer" className="text-primary underline">Open clinic page</a>
            </div>
          )}
        </div>
      );
    }

    case "clinic_rejected":
      return (
        <div className="text-sm font-medium text-left">
          Unfortunately, your clinic <span className="font-semibold">{d.name ?? "your clinic"}</span> application
          was not approved at this time. Please contact our support team for further details.
        </div>
      );

    case "booking_confirmed":
      return (
        <div className="space-y-1 text-left">
          <div className="text-sm font-medium">
            Your booking for <span className="font-semibold">{d.service_name ?? "your appointment"}</span> at{" "}
            <span className="font-semibold">{d.clinic_name ?? "the clinic"}</span> has been confirmed.
          </div>
          {d.scheduled_at && <div className="text-xs text-default-500">Scheduled for: {d.scheduled_at}</div>}
        </div>
      );

    case "booking_completed":
      return (<div className="text-sm font-medium text-left">Your treatment at <span className="font-semibold">{d.clinic_name ?? "the clinic"}</span> has been successfully completed. We hope everything went well!</div>);

    case "booking_canceled":
      return (<div className="text-sm font-medium text-left">Your booking at <span className="font-semibold">{d.clinic_name ?? "the clinic"}</span> has been canceled. If you have any questions, please contact the clinic directly.</div>);

    case "new_booking":
      return (<div className="text-sm font-medium text-left"><span className="font-semibold">{d.patient_name ?? "A new patient"}</span> has submitted a booking request for <span className="font-semibold">{d.service_name ?? "a service"}</span>. Please review it in your clinic dashboard.</div>);

    case "new_review":
      return (<div className="text-sm font-medium text-left"><span className="font-semibold">{d.reviewer_name ?? "A patient"}</span> has left a new review (rated {d.rating ?? "—"}/10) for <span className="font-semibold">{d.clinic_name ?? "your clinic"}</span>.</div>);

    case "new_referral":
      return (<div className="text-sm font-medium text-left">Great news! A new patient has registered through your <span className="font-semibold">{d.program_key ?? "referral"}</span> program. Keep sharing your link!</div>);

    case "new_partner_recruited":
      return (<div className="text-sm font-medium text-left">A new affiliate partner has joined your network through your recruitment link. You will earn commissions from their future referrals.</div>);

    case "new_inquiry":
      return (<div className="text-sm font-medium text-left"><span className="font-semibold">{d.sender_name ?? "A potential patient"}</span> has sent a new inquiry about <span className="font-semibold">{d.clinic_name ?? "your clinic"}</span>. Please respond as soon as possible.</div>);

    case "set_password":
      return (
        <div className="space-y-2 text-left">
          <div className="text-sm font-medium">Set a password for your account to enable faster sign-in.</div>
          <div className="text-xs text-default-500">You signed in via email link. <a href={d.action_url ?? "/settings"} className="text-primary underline font-medium">Go to Settings</a></div>
        </div>
      );

    default:
      return (<div className="text-sm text-left">{d.message ?? "You have a new notification."}</div>);
  }
}

export default function NotificationsBell() {
  const { supabase, session } = useSupabase() as SupabaseContextType;
  const router = useRouter();

  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (!session) return null;

  const loadNotifications = useCallback(async () => {
    if (!supabase || !session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications").select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(BELL_LIMIT);
    if (!error && data) setItems(data as NotificationRow[]);
    setLoading(false);
  }, [supabase, session]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const markAllRead = useCallback(async () => {
    if (!supabase || !session || unreadCount === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true })
      .eq("user_id", session.user.id).eq("is_read", false);
  }, [supabase, session, unreadCount]);

  return (
    <Dropdown
      placement="bottom-end"
      isOpen={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open && unreadCount > 0) markAllRead();
      }}
    >
      <DropdownTrigger>
        <Button className="h-8 w-8 min-w-0 p-0" size="sm" variant="ghost">
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
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Notifications"
        className="max-w-xs"
        disabledKeys={["title", "empty"]}
        itemClasses={{
          base: "data-[hover=true]:bg-default-100/50",
        }}
      >
        {/* Header — no hover via pointer-events-none on wrapper + close button with pointer-events-auto */}
        <DropdownItem key="title" className="cursor-default opacity-100 !bg-transparent" isReadOnly textValue="Notifications">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-default-500">
              Notifications
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsOpen(false);
              }}
              className="p-0.5 rounded text-default-400 hover:text-default-600 transition pointer-events-auto"
              aria-label="Close notifications"
            >
              <Icon icon="solar:close-circle-linear" width={16} />
            </button>
          </div>
        </DropdownItem>

        {items.length === 0 && !loading ? (
          <DropdownItem key="empty" className="cursor-default opacity-100" textValue="empty">
            <span className="text-xs text-default-500">No notifications yet.</span>
          </DropdownItem>
        ) : (
          <DropdownItem key="empty-ph" className="hidden" textValue="h"><span /></DropdownItem>
        )}

        {items.length > 0 ? (
          <>
            {items.map((n) => (
              <DropdownItem key={n.id} className="py-2" textValue={n.type}>
                {renderNotification(n)}
              </DropdownItem>
            ))}
          </>
        ) : (
          <DropdownItem key="items-ph" className="hidden" textValue="h"><span /></DropdownItem>
        )}

        <DropdownItem
          key="view-all"
          className="text-center"
          textValue="View all notifications"
          onPress={() => { setIsOpen(false); router.push("/profile?tab=notifications"); }}
        >
          <span className="text-sm font-medium text-primary">View all notifications</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}