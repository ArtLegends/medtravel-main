// components/admin/Table.tsx
export function Table({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-xl border bg-white">
    <table className="w-full text-sm">{children}</table>
  </div>;
}
export function Th({ children }: { children: React.ReactNode }) {
  return <th className="bg-gray-50 text-left font-semibold p-3">{children}</th>;
}
export function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-3 border-t">{children}</td>;
}
export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="hover:bg-gray-50 transition">{children}</tr>;
}
