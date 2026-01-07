// app/(partner)/partner/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  BarChart2,
  DollarSign,
  Settings,
  ListTree,
  LogOut,
  ChevronDown,
} from "lucide-react";

const MAIN_MENU = [
  { title: "Dashboard", href: "/partner", icon: LayoutDashboard },
  { title: "Programs", href: "/partner/programs", icon: ListTree },
  { title: "Reports", href: "/partner/reports", icon: BarChart2 },
  { title: "Bookings", href: "/partner/bookings", icon: Calendar },
];

const FINANCE_SUBMENU = [
  {
    title: "Balance breakdown",
    href: "/partner/finance/balance-breakdown",
  },
  {
    title: "Payouts history",
    href: "/partner/finance/payouts-history",
  },
  {
    title: "Payout method",
    href: "/partner/finance/payout-method",
  },
];

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [financeOpen, setFinanceOpen] = useState(false);

  // если мы в одном из finance-подразделов — раскрываем
  useEffect(() => {
    if (pathname?.startsWith("/partner/finance")) {
      setFinanceOpen(true);
    }
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/partner"
      ? pathname === "/partner"
      : pathname?.startsWith(href);

  const financeActive = pathname?.startsWith("/partner/finance");

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="mx-auto flex w-full max-w-[1920px]">
        {/* Sidebar */}
        <aside className="hidden w-[240px] shrink-0 border-r border-gray-200 bg-white lg:block">

          <nav className="p-2">
            <ul className="space-y-1">
              {MAIN_MENU.map((item) => {
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

              {/* Finance как селект с подпунктами */}
              <li>
                <button
                  type="button"
                  onClick={() => setFinanceOpen((v) => !v)}
                  className={[
                    "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition",
                    financeActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4" />
                    <span>Finance</span>
                  </span>
                  <ChevronDown
                    className={[
                      "h-4 w-4 transition-transform",
                      financeOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {financeOpen && (
                  <div className="mt-1 space-y-1">
                    {FINANCE_SUBMENU.map((item) => {
                      const active = pathname?.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={[
                            "block rounded-md px-6 py-1.5 text-xs transition",
                            active
                              ? "bg-gray-900 text-white"
                              : "text-gray-600 hover:bg-gray-100",
                          ].join(" ")}
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </li>
            </ul>
          </nav>

          {/* Back to Home */}
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

        {/* Content */}
        <div className="flex min-h-screen flex-1 flex-col">
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
