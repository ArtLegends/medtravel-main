export const metadata = { title: 'Admin • MedTravel' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* здесь твой сайдбар */}
      <aside className="w-64 border-r bg-white">…</aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
