// app/(admin)/admin/layout.tsx
import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="min-h-screen bg-slate-900 text-slate-100">
          <AdminSidebar />
        </aside>

        {/* Content */}
        <main className="min-h-screen">
          <AdminTopbar title="Admin Panel" />
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
