"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  LayoutGrid,
  CalendarCheck2,
  Inbox,
  Building2,
  Users,
  MessageSquareText,
  FileBarChart2,
  LifeBuoy,
  Shield,
  UserPlus,
  Home,
  FolderTree,
} from "lucide-react";

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type Group = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Item[];
};

const GROUPS: Group[] = [
  {
    label: "Overview",
    icon: LayoutGrid,
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutGrid }],
  },
  {
    label: "Operations",
    icon: FolderTree,
    items: [
      { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck2 },
      { label: "Clinic Requests", href: "/admin/clinic-requests", icon: Inbox },
      { label: "New Clinic Requests", href: "/admin/new-clinic-requests", icon: Inbox },

      // ✅ NEW
      { label: "Customer Signup Requests", href: "/admin/customer-signup-requests", icon: UserPlus },
    ],
  },
  {
    label: "Clinics",
    icon: Building2,
    items: [
      { label: "All Clinics", href: "/admin/clinics", icon: Building2 },
      { label: "Add New Clinic", href: "/admin/clinics/new", icon: Building2 },
    ],
  },
  {
    label: "Communication",
    icon: MessageSquareText,
    items: [
      { label: "Contacts", href: "/admin/contacts", icon: Users },
      { label: "Reviews", href: "/admin/reviews", icon: MessageSquareText },
      { label: "Reports", href: "/admin/reports", icon: FileBarChart2 },
      { label: "Clinic Inquiries", href: "/admin/clinic-inquiries", icon: LifeBuoy },
    ],
  },
  {
    label: "Users",
    icon: Users,
    items: [
      { label: "Partners", href: "/admin/partners", icon: Users },
      { label: "Patients", href: "/admin/patients", icon: Users },
    ],
  },
  {
    label: "Safety",
    icon: Shield,
    items: [{ label: "Moderation", href: "/admin/moderation", icon: LifeBuoy }],
  },
];

function isGroupActive(pathname: string | null, group: Group) {
  if (!pathname) return false;
  return group.items.some((it) => pathname === it.href || (it.href !== "/admin" && pathname.startsWith(it.href)));
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen flex-col bg-slate-800">
      {/* Brand */}
      <div className="px-6 pt-6 pb-4">
        <div className="text-2xl font-extrabold">
          <span className="text-teal-400">Med</span>
          <span className="text-slate-300">Travel</span>
        </div>
        <div className="mt-1 text-xs text-slate-400">Admin Panel</div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs bg-slate-600 text-slate-300">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          admin@medtravel.com
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex-1 space-y-2 px-2 overflow-y-auto">
        {GROUPS.map((g) => {
          const open = isGroupActive(pathname, g);
          const GIcon = g.icon;

          return (
            <details key={g.label} open={open} className="rounded-md">
              <summary
                className={[
                  "list-none cursor-pointer select-none rounded-md px-3 py-2 text-sm flex items-center gap-2",
                  open ? "bg-slate-900/40 text-white" : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
                ].join(" ")}
              >
                <GIcon className="h-4 w-4 opacity-90" />
                <span className="font-semibold">{g.label}</span>
                <span className="ml-auto text-slate-400">▾</span>
              </summary>

              <div className="mt-1 space-y-1 pl-2">
                {g.items.map((it) => {
                  const active =
                    pathname === it.href ||
                    (it.href !== "/admin" && pathname && pathname.startsWith(it.href));
                  const Icon = it.icon;

                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={[
                        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                        active
                          ? "bg-slate-800 text-white"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4 opacity-90" />
                      <span>{it.label}</span>
                    </Link>
                  );
                })}
              </div>
            </details>
          );
        })}
      </nav>

      {/* Back to home */}
      <div className="mt-2 px-2">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition
                     text-slate-300 hover:bg-slate-800/60 hover:text-white"
        >
          <Home className="h-4 w-4 opacity-90" />
          <span>Back to home</span>
        </Link>
      </div>

      <div className="px-4 py-4 text-xs text-slate-500 border-t border-slate-800">
        © 2025 MedTravel
      </div>
    </div>
  );
}
