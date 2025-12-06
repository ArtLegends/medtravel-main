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

export default function NotificationsBell() {
  const { supabase, session } =
    useSupabase() as SupabaseContextType;

  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);

  // гость — вообще не показываем иконку
  if (!session) return null;

  const loadNotifications = useCallback(async () => {
    if (!supabase || !session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) setItems(data as NotificationRow[]);
    setLoading(false);
  }, [supabase, session]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const markAllRead = useCallback(async () => {
    if (!supabase || !session || unreadCount === 0) return;

    setItems((prev) =>
      prev.map((n) => ({ ...n, is_read: true })),
    );

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);
  }, [supabase, session, unreadCount]);

  function renderText(n: NotificationRow) {
    if (n.type === "partner_program_approved") {
      const program = n.data?.program_key ?? "program";
      const code = n.data?.ref_code as string | undefined;
      const url = n.data?.referral_url as string | undefined;

      return (
        <div className="space-y-1 text-left">
          <div className="text-sm font-medium">
            Your request for{" "}
            <span className="font-semibold">{program}</span> program
            has been approved.
          </div>
          {code && (
            <div className="text-xs text-default-500">
              Referral code:{" "}
              <span className="font-mono">{code}</span>
            </div>
          )}
          {url && (
            <div className="text-xs text-default-500 break-all">
              Referral link: {url}
            </div>
          )}
        </div>
      );
    }

    if (n.type === "clinic_approved") {
      const data = n.data ?? {};
      const clinicName = data?.name ?? "your clinic";

      let clinicUrl: string | null = null;
      try {
        if (data?.slug) {
          clinicUrl = clinicHref({
            slug: data.slug,
            country: data.country ?? undefined,
            province: data.province ?? undefined,
            city: data.city ?? undefined,
            district: data.district ?? undefined,
          });
        }
      } catch {
        clinicUrl = null;
      }

      return (
        <div className="space-y-1 text-left">
          <div className="text-sm font-medium">
            Your clinic{" "}
            <span className="font-semibold">{clinicName}</span> has
            been published.
          </div>
          {clinicUrl && (
            <div className="text-xs text-default-500">
              <a
                href={clinicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                Open clinic page
              </a>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="text-sm">
        {n.data?.message ?? "Notification"}
      </div>
    );
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          className="h-8 w-8 min-w-0 p-0"
          size="sm"
          variant="ghost"
          onClick={markAllRead}
        >
          <Badge
            color={unreadCount > 0 ? "danger" : "default"}
            content={
              unreadCount > 0 ? String(Math.min(unreadCount, 9)) : ""
            }
            isInvisible={unreadCount === 0}
            placement="top-right"
            shape="circle"
            size="sm"
          >
            <Icon
              className="text-default-500"
              icon="solar:bell-linear"
              width={22}
            />
          </Badge>
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Notifications"
        className="max-w-xs"
        disabledKeys={["title"]}
      >
        <DropdownItem key="title" className="cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-default-500">
              Notifications
            </span>
            {loading ? (
              <span className="text-[10px] text-default-400">
                Loading…
              </span>
            ) : (
              <span className="text-[10px] text-default-400">
                {items.length === 0 ? "0" : `${items.length}`}
              </span>
            )}
          </div>
        </DropdownItem>

        {/* Пустое состояние — всегда возвращаем элемент, без `false` */}
        {items.length === 0 && !loading ? (
          <DropdownItem key="empty" className="cursor-default">
            <span className="text-xs text-default-500">
              No notifications yet.
            </span>
          </DropdownItem>
        ) : (
          <></>
        )}

        {/* Список уведомлений — заворачиваем в Fragment, чтобы не было `Element[]` */}
        {items.length > 0 ? (
          <>
            {items.map((n) => (
              <DropdownItem key={n.id} className="py-2">
                {renderText(n)}
              </DropdownItem>
            ))}
          </>
        ) : (
          <></>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
