export const dynamic = "force-dynamic";

import Link from "next/link";
import AppointmentWizard from "@/components/patient/AppointmentWizard";

export default function PatientAppointmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Make an Appointment</h1>
          <p className="mt-1 text-sm text-gray-500">Book your medical appointment in 4 easy steps</p>
        </div>

        <Link
          href="/patient"
          className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <AppointmentWizard />
    </div>
  );
}
