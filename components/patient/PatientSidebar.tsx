"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type NavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/patient/dashboard" },
  { label: "My Bookings", href: "/patient/bookings" },
  { label: "Visit History", href: "/patient/visits" },
  { label: "Make an Appointment", href: "/patient/appointment" },
  { label: "Settings", href: "/patient/settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/patient/dashboard") {
    return pathname === "/patient" || pathname === href;
  }
  return pathname.startsWith(href);
}

export default function PatientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Brand */}
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-white">
          MT
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            Patient Portal
          </span>
          <span className="text-xs text-gray-500">MedTravel.me</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              ].join(" ")}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back to home */}
      <div className="border-t px-3 py-4">
        <Link
          href="/"
          className="flex w-full items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Back to home
        </Link>
      </div>
    </aside>
  );
}
