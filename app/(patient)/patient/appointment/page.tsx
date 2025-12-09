// app/(patient)/patient/appointment/page.tsx

export const dynamic = "force-dynamic";

export default function PatientAppointmentPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-20 text-center space-y-4">
      {/* иконка / бейдж WIP */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">
        🛠️
      </div>

      <h1 className="text-2xl font-semibold text-gray-900">
        Appointment booking in progress
      </h1>

      <p className="max-w-md text-sm text-gray-500">
        We’re currently working on this section. Soon you’ll be able to
        request and manage appointments directly from your patient portal.
      </p>

      <a
        href="/patient"
        className="mt-4 inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
      >
        ← Back to dashboard
      </a>
    </div>
  );
}
