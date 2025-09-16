// components/admin/AdminTopbar.tsx
type Props = {
  title: string;
  subtitle?: string;
};

export default function AdminTopbar({ title, subtitle }: Props) {
  return (
    <div className="admin-topbar sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="px-6 py-5">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <div className="admin-topbar-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}