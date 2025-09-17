// components/admin/dashboard/TrendsChart.tsx
"use client";

type Series = { label: string; color: string; values: number[] };
type Props = { months: string[]; series: Series[] };

export default function TrendsChart({ months, series }: Props) {
  const max = Math.max(
    ...series.flatMap(s => s.values)
  ) || 1;
  const barW = 20;
  const groupGap = 28;
  const groupW = series.length * barW + (series.length - 1) * 8;
  const width = months.length * (groupW + groupGap);
  const height = 220;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-medium">Booking Trends</div>
      <svg width={width} height={height}>
        {/* ось X метки */}
        {months.map((m, i) => (
          <text
            key={m}
            x={i * (groupW + groupGap) + groupW / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
          >
            {m}
          </text>
        ))}

        {/* бары */}
        {months.map((_, gi) => {
          const groupX = gi * (groupW + groupGap);
          return series.map((s, si) => {
            const v = s.values[gi] ?? 0;
            const h = Math.round((v / max) * (height - 40));
            const x = groupX + si * (barW + 8);
            const y = height - 20 - h;
            return (
              <rect
                key={`${gi}-${si}`}
                x={x}
                y={y}
                width={barW}
                height={h}
                rx="4"
                fill={s.color}
              />
            );
          });
        })}
      </svg>

      {/* легенда */}
      <div className="mt-3 flex gap-4 text-xs text-gray-600">
        {series.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: s.color }}
            />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
