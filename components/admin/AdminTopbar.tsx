// components/admin/AdminTopbar.tsx
"use client";

import { useSidebar } from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminTopbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { toggle } = useSidebar();

  return (
    <header className="flex items-center border-b bg-white px-4 lg:px-6 py-4">
      <button
        onClick={toggle}
        className="lg:hidden mr-3 rounded-md p-2 text-slate-600 hover:bg-slate-200"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </header>
  );
}