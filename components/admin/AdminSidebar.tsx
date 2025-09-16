"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CalendarCheck2,
  Inbox,
  Building2,
  Users,
  MessageSquareText,
  FileBarChart2,
  LifeBuoy,
} from "lucide-react";

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV: Item[] = [
  { label: "Dashboard",       href: "/admin",              icon: LayoutGrid },
  { label: "Bookings",        href: "/admin/bookings",     icon: CalendarCheck2 },
  { label: "Clinic Requests", href: "/admin/clinic-requests", icon: Inbox },
  { label: "All Clinics",     href: "/admin/clinics",      icon: Building2 },
  { label: "Contacts",        href: "/admin/contacts",     icon: Users },
  { label: "Reviews",         href: "/admin/reviews",      icon: MessageSquareText },
  { label: "Reports",         href: "/admin/reports",      icon: FileBarChart2 },
  { label: "Clinic Inquiries",href: "/admin/inquiries",    icon: LifeBuoy },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen flex-col">
      {/* Brand */}
      <div className="px-6 pt-6 pb-4">
        <div className="text-2xl font-extrabold">
          <span className="text-teal-400">Med</span>Travel
        </div>
        <div className="mt-1 text-xs text-slate-400">Admin Panel</div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-xs text-slate-300">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          admin@medtravel.com
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-1 px-2">
        {NAV.map((it) => {
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
      </nav>

      {/* Footer / Logout placeholder */}
      <div className="px-4 py-4 text-xs text-slate-500 border-t border-slate-800">
        © 2025 MedTravel
      </div>
    </div>
  );
}
