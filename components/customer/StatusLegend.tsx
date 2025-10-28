export default function StatusLegend() {
  const Dot = ({ className }: { className: string }) => (
    <span className={`inline-block h-2 w-2 rounded-full ${className}`} />
  );
  return (
    <div className="flex items-center gap-4 text-xs text-gray-600">
      <span className="flex items-center gap-2"><Dot className="bg-emerald-500" /> confirmed</span>
      <span className="flex items-center gap-2"><Dot className="bg-amber-500" /> pending</span>
      <span className="flex items-center gap-2"><Dot className="bg-rose-500" /> canceled</span>
    </div>
  );
}
