// app/(admin)/layout.tsx
export default function AdminGroupLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-content">
      {children}
    </div>
  );
}