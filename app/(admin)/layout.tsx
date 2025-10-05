// app/(admin)/layout.tsx
export default function AdminGroupLayout({
  children,
}: { children: React.ReactNode }) {
  // НИКАКОЙ логики входа/ролей/редиректов — чистый рендер
  return (
    <div className="min-h-screen bg-content">
      {children}
    </div>
  );
}