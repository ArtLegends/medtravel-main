// components/customer/CustomerSidebar.tsx
import Link from "next/link";

export default function CustomerSidebar({
  handle,
  nav,
}: {
  handle: string;
  nav: { title: string; href: string; icon?: any }[];
}) {
  return (
    <aside className="w-64 border-r bg-white">
      <nav className="p-4 space-y-1">
        {nav.map((i) => (
          <Link key={i.href} href={i.href} className="block rounded px-3 py-2 hover:bg-gray-50">
            {i.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
