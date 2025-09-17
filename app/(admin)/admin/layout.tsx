// app/(admin)/layout.tsx
import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* левый сайдбар */}
      <AdminSidebar />

      {/* правая часть */}
      <div className="flex-1 bg-gray-50">
        <AdminTopbar title="Admin Panel" subtitle="Overview" />
        <main className="px-6 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
