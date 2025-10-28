// app/(customer)/customer/layout.tsx
import type { ReactNode } from 'react';
import Link from 'next/link';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1280px] px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-xl border bg-white p-4">
            <div className="mb-4 text-xl font-semibold">
              <span className="text-teal-600">Med</span>Travel
            </div>
            <nav className="space-y-1 text-[15px]">
              <NavItem href="/customer" label="Dashboard" />
              <NavItem href="/customer/bookings" label="Bookings" />
              <NavItem href="/customer/patients" label="Patients" />
              <NavItem href="/customer/profile" label="Clinic Profile" />
              <NavItem href="/customer/transactions" label="Transactions" />
              <NavItem href="/customer/settings" label="Settings" />
              <NavItem href="/customer/reports" label="Reports" />
            </nav>

            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
              >
                ↪ Back to Home
              </Link>
            </div>
          </aside>

          {/* Content */}
          <main className="rounded-xl border bg-white p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  // простая активность — можно заменить на usePathname
  const active = false;
  return (
    <Link
      href={href}
      className={
        'block rounded-lg px-3 py-2 ' +
        (active ? 'bg-gray-900 text-white' : 'hover:bg-gray-50')
      }
    >
      {label}
    </Link>
  );
}
