"use client";

import { Suspense, lazy } from "react";

// Lazy load Recharts to reduce initial bundle size
const LazyLineChart = lazy(() =>
  import("recharts").then((mod) => ({ default: mod.LineChart })),
);
const LazyBarChart = lazy(() =>
  import("recharts").then((mod) => ({ default: mod.BarChart })),
);
const LazyPieChart = lazy(() =>
  import("recharts").then((mod) => ({ default: mod.PieChart })),
);

// Chart loading skeleton
const ChartSkeleton = () => (
  <div className="w-full h-64 bg-content2 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-default-500">Loading chart...</div>
  </div>
);

interface DynamicChartProps {
  type: "line" | "bar" | "pie";
  data: any[];
  config: any;
  className?: string;
}

export const DynamicChart = ({
  type,
  data,
  config,
  className,
}: DynamicChartProps) => {
  const ChartComponent = () => {
    switch (type) {
      case "line":
        return (
          <Suspense fallback={<ChartSkeleton />}>
            <LazyLineChart {...config} className={className} data={data} />
          </Suspense>
        );
      case "bar":
        return (
          <Suspense fallback={<ChartSkeleton />}>
            <LazyBarChart {...config} className={className} data={data} />
          </Suspense>
        );
      case "pie":
        return (
          <Suspense fallback={<ChartSkeleton />}>
            <LazyPieChart {...config} className={className} data={data} />
          </Suspense>
        );
      default:
        return <ChartSkeleton />;
    }
  };

  return <ChartComponent />;
};
