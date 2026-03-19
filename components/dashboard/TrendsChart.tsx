// components/dashboard/TrendsChart.tsx
"use client";

type Series = { label: string; color: string; values: number[] };
type Props = { months: string[]; series: Series[] };

export default function TrendsChart({ months, series }: Props) {
  const max = Math.max(...series.flatMap((s) => s.values)) || 1;
  const barCount = series.length;
  const groupCount = months.length;

  // Use viewBox for responsive SVG
  const svgWidth = 600;
  const svgHeight = 220;
  const padLeft = 10;
  const padRight = 10;
  const padBottom = 24;
  const padTop = 10;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padBottom - padTop;

  const groupW = chartW / groupCount;
  const barW = Math.min(20, (groupW - 12) / barCount);
  const barGap = 4;
  const totalBarsW = barCount * barW + (barCount - 1) * barGap;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm min-w-0 overflow-hidden">
      <div className="mb-3 text-sm font-medium">Booking Trends</div>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[280px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {months.map((m, i) => {
            const cx = padLeft + i * groupW + groupW / 2;
            return (
              <text
                key={m}
                x={cx}
                y={svgHeight - 4}
                textAnchor="middle"
                fontSize="11"
                fill="#6b7280"
              >
                {m}
              </text>
            );
          })}

          {months.map((_, gi) => {
            const groupX = padLeft + gi * groupW + (groupW - totalBarsW) / 2;
            return series.map((s, si) => {
              const v = s.values[gi] ?? 0;
              const h = Math.round((v / max) * chartH);
              const x = groupX + si * (barW + barGap);
              const y = padTop + chartH - h;
              return (
                <rect
                  key={`${gi}-${si}`}
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(h, 0)}
                  rx="3"
                  fill={s.color}
                />
              );
            });
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
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