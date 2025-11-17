// app/(customer)/customer/[handle]/layout.tsx
import { ReactNode } from "react";
import { LayoutDashboard, Calendar, Users, FileText, DollarSign, Settings, BarChart2 } from "lucide-react";
import CustomerSidebar from "@/components/customer/CustomerSidebar";

type Params = { handle: string };

export default async function CustomerLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<Params>;
}) {
  const { handle } = await params;

  const MENU = [
    { title: "Dashboard",      href: `/customer/${handle}`,                 icon: LayoutDashboard },
    { title: "Bookings",       href: `/customer/${handle}/bookings`,        icon: Calendar },
    { title: "Patients",       href: `/customer/${handle}/patients`,        icon: Users },
    { title: "Reviews",        href: `/customer/${handle}/reviews`,         icon: Users },
    { title: "Clinic Profile", href: `/customer/${handle}/clinic-profile`,  icon: FileText },
    { title: "Transactions",   href: `/customer/${handle}/transactions`,    icon: DollarSign },
    { title: "Settings",       href: `/customer/${handle}/settings`,        icon: Settings },
    { title: "Reports",        href: `/customer/${handle}/reports`,         icon: BarChart2 },
  ];

  return (
    <div className="flex">
      <CustomerSidebar handle={handle} nav={MENU} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
