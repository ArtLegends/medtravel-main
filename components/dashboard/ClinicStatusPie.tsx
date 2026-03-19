// components/dashboard/ClinicStatusPie.tsx
type Slice = { label: string; color: string; value: number };

export default function ClinicStatusPie({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const angles = data.map((d) => Math.round((d.value / total) * 360));
  let offset = 0;
  const gradient = angles
    .map((a, i) => {
      const start = offset;
      const end = offset + a;
      offset = end;
      return `${data[i].color} ${start}deg ${end}deg`;
    })
    .join(", ");

  const published = data.find((d) => d.label === "Published");

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm min-w-0 overflow-hidden">
      <div className="mb-3 text-sm font-medium">Clinic Status</div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div
          className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full flex-shrink-0"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="absolute inset-3 rounded-full bg-white" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-gray-500">Published</div>
              <div className="text-lg sm:text-xl font-semibold">
                {Math.round(((published?.value ?? 0) / total) * 100)}%
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-sm flex-shrink-0"
                style={{ background: d.color }}
              />
              <span className="text-gray-600">{d.label}</span>
              <span className="font-medium">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}