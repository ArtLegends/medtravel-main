// app/clinic/[slug]/layout.tsx
export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[100vw] overflow-x-clip">
      {children}
    </div>
  );
}