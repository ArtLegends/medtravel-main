// app/(admin)/admin/layout.tsx
import type { ReactNode } from "react";
import AdminSidebar, { SidebarProvider } from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="h-screen flex overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden min-w-0">
          <AdminTopbar title="Admin Panel" subtitle="Overview" />
          <main className="flex-1 px-4 lg:px-6 pb-12 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}