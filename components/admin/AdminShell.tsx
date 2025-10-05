// components/admin/AdminShell.tsx
import AdminSidebar from './AdminSidebar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </main>
    </div>
  );
}
