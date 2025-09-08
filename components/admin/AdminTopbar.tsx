'use client';
export default function AdminTopbar({ title, subtitle }:{title:string; subtitle?:string}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded-md border bg-white">Refresh</button>
        <button className="px-3 py-2 rounded-md border bg-white">Test DB</button>
        <button className="px-3 py-2 rounded-md border bg-white">Export CSV</button>
        <button className="px-3 py-2 rounded-md bg-rose-600 text-white">Delete All</button>
      </div>
    </div>
  );
}
