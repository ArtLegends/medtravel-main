// app/(customer)/customer/bookings/page.tsx
import { Calendar, RefreshCw, Database, Download, Trash2 } from "lucide-react";
import TableShell from "@/components/customer/TableShell";

function OutlineBtn({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-gray-500">Manage booking requests for your clinic</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OutlineBtn>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </OutlineBtn>
          <OutlineBtn>
            <Database className="h-4 w-4" />
            Test DB
          </OutlineBtn>
          <OutlineBtn>
            <Download className="h-4 w-4" />
            Export CSV
          </OutlineBtn>
          <button className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-600">
            <Trash2 className="h-4 w-4" />
            Delete All
          </button>
        </div>
      </div>

      {/* Filters card */}
      <div className="rounded-xl border bg-white p-4">
        {/* Dates row */}
        <div className="mb-4 flex flex-wrap gap-2">
          <OutlineBtn>
            <Calendar className="h-4 w-4" />
            Pick a date
          </OutlineBtn>
          <OutlineBtn>
            <Calendar className="h-4 w-4" />
            Pick a date
          </OutlineBtn>
          <OutlineBtn>Clear Dates</OutlineBtn>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Search</label>
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium">All Statuses</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Statuses</option>
              <option>New</option>
              <option>Processed</option>
              <option>Rejected</option>
            </select>
          </div>

          {/* Services */}
          <div className="space-y-1">
            <label className="text-sm font-medium">All Services</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Services</option>
            </select>
          </div>

          {/* Methods */}
          <div className="space-y-1">
            <label className="text-sm font-medium">All Methods</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Methods</option>
            </select>
          </div>
        </div>

        {/* Reset */}
        <div className="mt-4 flex justify-end">
          <OutlineBtn>Reset Filters</OutlineBtn>
        </div>
      </div>

      {/* Table */}
      <TableShell
        head={
          <>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Phone</th>
            <th className="px-4 py-3 text-left">Contact Method</th>
            <th className="px-4 py-3 text-left">Service</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Created At</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </>
        }
        empty={<span className="text-gray-500">No booking records found.</span>}
      />

      {/* Bottom destructive button (как в шаблоне) */}
      <button className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-600">
        <Trash2 className="h-4 w-4" />
        Delete All
      </button>
    </div>
  );
}
