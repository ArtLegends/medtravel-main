// app/(patient)/patient/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import ReferralAttach from "@/components/patient/ReferralAttach";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/patient",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 13h7V4H4v9zM13 20h7V11h-7v9zM13 4h7v5h-7V4zM4 16h7v4H4v-4z" />
      </svg>
    ),
  },
  {
    label: "My Bookings",
    href: "/patient/bookings",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      </svg>
    ),
  },
  {
    label: "Visit History",
    href: "/patient/visits",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 8v5l3 2" />
        <path d="M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9z" />
      </svg>
    ),
  },
  {
    label: "Make an Appointment",
    href: "/patient/appointment",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/patient") return pathname === "/patient";
  return pathname.startsWith(href);
}

function SidebarContent({
  pathname,
  onNavClick,
}: {
  pathname: string;
  onNavClick?: () => void;
}) {
  return (
    <>
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavClick}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition",
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  ].join(" ")}
                >
                  <span className="text-gray-500">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <Link
          href="/"
          onClick={onNavClick}
          className="flex w-full items-center justify-start gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <span aria-hidden className="text-gray-500">←</span>
          Back to home
        </Link>
      </div>
    </>
  );
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[240px] shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col sticky top-0 h-screen">
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
          <span className="font-semibold text-gray-900">Patient Panel</span>
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
          <span className="ml-3 font-semibold text-gray-900">Patient Panel</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6 lg:px-8 lg:py-8">
            <ReferralAttach />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}