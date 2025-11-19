// app/(customer)/customer/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  DollarSign,
  Settings,
  BarChart2,
  LogOut,
  Menu,
} from "lucide-react";

const MENU = [
  { title: "Dashboard",      href: "/customer",                 icon: LayoutDashboard },
  { title: "Bookings",       href: "/customer/bookings",        icon: Calendar },
  { title: "Patients",       href: "/customer/patients",        icon: Users },
  { title: "Reviews",       href: "/customer/reviews",        icon: Users },
  { title: "Clinic Profile", href: "/customer/clinic-profile",  icon: FileText },
  { title: "Transactions",   href: "/customer/transactions",    icon: DollarSign },
  { title: "Reports",        href: "/customer/reports",         icon: BarChart2 },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/customer"
      ? pathname === "/customer"
      : pathname?.startsWith(href);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="mx-auto flex w-full max-w-[1920px]">
        {/* Sidebar */}
        <aside className="hidden w-[240px] shrink-0 border-r border-gray-200 bg-white lg:block">
          <nav className="p-2">
            <ul className="space-y-1">
              {MENU.map((item) => {
                const ActiveIcon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                        active
                          ? "bg-gray-900 text-white"
                          : "text-gray-700 hover:bg-gray-100",
                      ].join(" ")}
                    >
                      <ActiveIcon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-gray-200 p-4">
            <Link
              href="/"
              className="flex w-full items-center justify-start gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </aside>

        {/* Right side: header + main */}
        <div className="flex min-h-screen flex-1 flex-col">

          {/* Content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
