// app/(supervisor)/supervisor/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BarChart2,
  DollarSign,
  LogOut,
  ChevronDown,
  Users,
  Menu,
  X,
} from "lucide-react";

const MAIN_MENU = [
  { title: "Dashboard", href: "/supervisor", icon: LayoutDashboard },
  { title: "My Partners", href: "/supervisor/partners", icon: Users },
  { title: "Reports", href: "/supervisor/reports", icon: BarChart2 },
];

const FINANCE_SUBMENU = [
  { title: "Balance breakdown", href: "/supervisor/finance/balance-breakdown" },
  { title: "Payouts history", href: "/supervisor/finance/payouts-history" },
  { title: "Payout method", href: "/supervisor/finance/payout-method" },
];

function SidebarContent({
  pathname,
  onNavClick,
}: {
  pathname: string | null;
  onNavClick?: () => void;
}) {
  const [financeOpen, setFinanceOpen] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/supervisor/finance")) setFinanceOpen(true);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/supervisor"
      ? pathname === "/supervisor"
      : pathname?.startsWith(href);

  const financeActive = pathname?.startsWith("/supervisor/finance");

  return (
    <>
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {MAIN_MENU.map((item) => {
            const ActiveIcon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavClick}
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

          {/* Finance with submenu */}
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
                className={`h-4 w-4 transition-transform ${financeOpen ? "rotate-180" : ""}`}
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
                      onClick={onNavClick}
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

      <div className="border-t border-gray-200 p-4">
        <Link
          href="/"
          onClick={onNavClick}
          className="flex w-full items-center justify-start gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </>
  );
}

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="mx-auto flex w-full max-w-[1920px]">
        {/* Desktop Sidebar */}
        <aside className="hidden w-[240px] shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
          <SidebarContent pathname={pathname} />
        </aside>

        {/* Mobile Drawer Overlay */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-xl transition-transform duration-200 lg:hidden flex flex-col ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="font-semibold text-gray-900">Supervisor Panel</span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <SidebarContent
            pathname={pathname}
            onNavClick={() => setDrawerOpen(false)}
          />
        </aside>

        {/* Right side: topbar + main */}
        <div className="flex min-h-screen flex-1 flex-col min-w-0">
          {/* Mobile Topbar */}
          <header className="flex items-center border-b bg-white px-4 py-3 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="ml-3 font-semibold text-gray-900">Supervisor Panel</span>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}