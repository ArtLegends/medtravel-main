import CustomerStat from "@/components/customer/CustomerStat";
import MiniLineChart from "@/components/customer/MiniLineChart";
import StatusLegend from "@/components/customer/StatusLegend";
import TableShell from "@/components/customer/TableShell";

export default function CustomerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome to Customer Panel!</h1>
        <p className="text-gray-600">Manage your medical practice efficiently</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CustomerStat title="Doctors" value={0} />
        <CustomerStat title="Patients" value={0} />
        <CustomerStat title="Bookings" value={0} />
        <CustomerStat title="Revenue" value={"$0"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MiniLineChart title="Revenue" />
        <div className="space-y-3">
          <MiniLineChart title="Status" legend={<StatusLegend />} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-4 text-lg font-semibold">Doctors List</div>
          <div className="text-center py-6 text-gray-500">No doctors added yet</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-4 text-lg font-semibold">Patients List</div>
          <div className="text-center py-6 text-gray-500">No patients added yet</div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="mb-4 text-lg font-semibold">Appointment List</div>
        <div className="text-center py-6 text-gray-500">No appointments scheduled yet</div>
      </div>
    </div>
  );
}
