// components/customer/CustomerSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Dashboard",      href: "/customer" },
  { label: "Bookings",       href: "/customer/bookings" },
  { label: "Patients",       href: "/customer/patients" },
  { label: "Clinic Profile", href: "/customer/clinic-profile" },
  { label: "Transactions",   href: "/customer/transactions" },
  { label: "Settings",       href: "/customer/settings" },
  { label: "Reports",        href: "/customer/reports" },
];

export default function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 text-sm">
      {NAV.map((item) => {
        const active = pathname === item.href || (item.href !== "/customer" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              "block rounded-md px-3 py-2 " +
              (active ? "bg-gray-900 text-white" : "hover:bg-gray-100")
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
