// app/(admin)/admin/layout.tsx
import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* левый сайдбар (фиксируем на всю высоту) */}
      <AdminSidebar />

      {/* правая часть — скроллится только контент */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        <AdminTopbar title="Admin Panel" subtitle="Overview" />
        <main className="flex-1 px-6 pb-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
