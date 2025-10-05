// components/admin/DatePickerFake.tsx
export default function DatePickerFake({ label }: { label: string }) {
  return (
    <button className="h-10 px-3 rounded-md border bg-white flex items-center gap-2">
      <span className="i">📅</span>
      <span className="text-sm text-gray-600">{label}</span>
    </button>
  );
}
