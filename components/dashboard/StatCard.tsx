// components/dashboard/StatCard.tsx
type Props = {
  title: string;
  value: string | number;
  footer?: string;
  icon?: React.ReactNode;
};
export default function StatCard({ title, value, footer, icon }: Props) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm min-w-0">
      <div className="flex items-start justify-between">
        <div className="text-sm text-gray-500 truncate">{title}</div>
        {icon ? <div className="text-gray-400 flex-shrink-0">{icon}</div> : null}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {footer ? <div className="mt-1 text-xs text-gray-500 break-words">{footer}</div> : null}
    </div>
  );
}