// components/partner/PartnerSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mainNav = [
  { label: "Dashboard", href: "/partner" },
  { label: "Referrals", href: "/partner/referrals" },
  { label: "Programs", href: "/partner/programs" },
  { label: "Reports", href: "/partner/reports" },
  { label: "Bookings", href: "/partner/bookings" },
  { label: "Finance", href: "/partner/finance" },
];

const financeSubNav = [
  { label: "Balance breakdown", href: "/partner/finance/balance-breakdown" },
  { label: "Payouts history", href: "/partner/finance/payouts-history" },
  { label: "Payout method", href: "/partner/finance/payout-method" },
];

function navItemClass(active: boolean) {
  return [
    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-slate-100 text-slate-900"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");
}

export default function PartnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-white">
      <div className="h-16 flex items-center px-4 border-b">
        <span className="text-base font-semibold">MedTravel.me</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6">
        <div className="space-y-1">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navItemClass(
                item.href === "/partner"
                  ? pathname === "/partner"
                  : pathname.startsWith(item.href)
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Finance sub-items (отдельным блоком, можно будет стилизовать как вложенное меню) */}
        <div className="space-y-1">
          {financeSubNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navItemClass(pathname.startsWith(item.href))}
            >
              <span className="ml-2 text-xs uppercase tracking-wide">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t px-3 py-4">
        <Link
          href="/"
          className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          Back to Home
        </Link>
      </div>
    </aside>
  );
}
