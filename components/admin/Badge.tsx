// components/admin/Badge.tsx
export default function Badge({ children, color }: { children: React.ReactNode; color: 'green' | 'blue' | 'red' | 'gray' }) {
  const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  const map = {
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-rose-100 text-rose-700',
    gray: 'bg-gray-100 text-gray-700',
  } as const;
  return <span className={`${base} ${map[color]}`}>{children}</span>;
}
