"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type NavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
};

function Icon({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
      {children}
    </span>
  );
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/patient",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 13h7V4H4v9zM13 20h7V11h-7v9zM13 4h7v5h-7V4zM4 16h7v4H4v-4z" />
        </svg>
      </Icon>
    ),
  },
  {
    label: "My Bookings",
    href: "/patient/bookings",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
        </svg>
      </Icon>
    ),
  },
  {
    label: "Visit History",
    href: "/patient/visits",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8v5l3 2" />
          <path d="M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9z" />
        </svg>
      </Icon>
    ),
  },
  {
    label: "Make an Appointment",
    href: "/patient/appointment",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Icon>
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
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r bg-white">
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
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* гарантированно снизу */}
      <div className="mt-auto border-t px-3 py-4">
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span aria-hidden>←</span>
          <span>Back to home</span>
        </Link>
      </div>
    </aside>
  );
}
