// app/(customer)/customer/reports/page.tsx
import ReportsClient from "./ReportsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ReportsPage() {
  return <ReportsClient />;
}
