'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/admin',              label: 'Dashboard' },
  { href: '/admin/bookings',     label: 'Bookings' },
  { href: '/admin/clinic-requests', label: 'Clinic Requests' },
  { href: '/admin/clinics',      label: 'All Clinics' },
  { href: '/admin/contacts',     label: 'Contacts' },
  { href: '/admin/reviews',      label: 'Reviews' },
  { href: '/admin/reports',      label: 'Reports' },
  { href: '/admin/clinic-inquiries', label: 'Clinic Inquiries' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 border-r bg-slate-900 text-white">
      <div className="px-5 h-16 flex items-center text-lg font-semibold">
        <span className="text-emerald-400">Med</span>Travel
        <span className="ml-2 text-xs opacity-70">Admin Panel</span>
      </div>
      <div className="px-5 pb-3 text-sm opacity-80">admin@medtravel.com</div>
      <nav className="px-2 py-2 space-y-1">
        {items.map(it => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`block rounded-md px-3 py-2 text-sm ${active ? 'bg-slate-800 text-white' : 'text-slate-200 hover:bg-slate-800'}`}
            >
              {it.label}
            </Link>
          );
        })}
        <form action="/api/admin/logout" method="post" className="px-2 pt-4">
          <button className="w-full rounded-md bg-slate-800 py-2 text-slate-100 hover:bg-slate-700">
            Log out
          </button>
        </form>
      </nav>
    </aside>
  );
}
