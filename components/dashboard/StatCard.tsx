// components/admin/dashboard/StatCard.tsx
type Props = {
  title: string;
  value: string | number;
  footer?: string;
  icon?: React.ReactNode;
};
export default function StatCard({ title, value, footer, icon }: Props) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="text-sm text-gray-500">{title}</div>
        {icon ? <div className="text-gray-400">{icon}</div> : null}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {footer ? <div className="mt-1 text-xs text-gray-500">{footer}</div> : null}
    </div>
  );
}
