// app/(patient)/patient/layout.tsx
import type { ReactNode } from "react";
import PatientSidebar from "@/components/patient/PatientSidebar";
import ReferralAttach from "@/components/patient/ReferralAttach";

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <PatientSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
          <ReferralAttach />
          {children}
        </div>
      </main>
    </div>
  );
}
