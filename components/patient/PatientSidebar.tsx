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
  {
    label: "Dashboard",
    href: "/patient",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 13h7V4H4v9zM13 20h7V11h-7v9zM13 4h7v5h-7V4zM4 16h7v4H4v-4z" />
      </svg>
    ),
  },
  {
    label: "My Bookings",
    href: "/patient/bookings",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      </svg>
    ),
  },
  {
    label: "Visit History",
    href: "/patient/visits",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 8v5l3 2" />
        <path d="M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9z" />
      </svg>
    ),
  },
  {
    label: "Make an Appointment",
    href: "/patient/appointment",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/patient") return pathname === "/patient";
  return pathname.startsWith(href);
}

export default function PatientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-[240px] shrink-0 border-r border-gray-200 bg-white">
      <nav className="p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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

      {/* как в customer: кнопка сразу под меню, без mt-auto */}
      <div className="border-t border-gray-200 p-4">
        <Link
          href="/"
          className="flex w-full items-center justify-start gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <span aria-hidden className="text-gray-500">
            ←
          </span>
          Back to home
        </Link>
      </div>
    </aside>
  );
}
