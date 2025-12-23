import PatientsListClient from "@/components/customer/PatientsListClient";

export const dynamic = "force-dynamic";

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">List of Patient</h1>
        <p className="text-gray-600 mt-2">Manage and view all patient records</p>
      </div>

      <PatientsListClient />
    </div>
  );
}
