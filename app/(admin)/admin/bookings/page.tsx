import AdminTopbar from '@/components/admin/AdminTopbar';
import DatePickerFake from '@/components/admin/DatePickerFake';
import { Table, Th, Tr, Td } from '@/components/admin/Table';
import Badge from '@/components/admin/Badge';

const rows = [
  { name:'dfffdnjndh', phone:'+7(937) 394 - 57 - 53', contact:'telegram', service:'crowns', status:'Processed', created:'26.04.2025, 12:32:25' },
  { name:'hgfhfgretewsr', phone:'+7(937) 394 - 57 - 53', contact:'email', service:'veneers', status:'New', created:'22.04.2025, 10:29:05' },
  { name:'testqweqweqwqgdfg', phone:'+7(937) 394 - 57 - 53', contact:'email', service:'crowns', status:'Rejected', created:'22.04.2025, 10:28:54' },
];

function statusColor(s:string): 'green'|'blue'|'red'|'gray' {
  if (s === 'Processed') return 'green';
  if (s === 'New') return 'blue';
  if (s === 'Rejected') return 'red';
  return 'gray';
}

export default function Page() {
  return (
    <>
      <AdminTopbar
        title="Bookings"
        subtitle="Manage booking requests from customers"
      />

      {/* фильтры */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="text-sm font-medium">Start Date</div>
        <DatePickerFake label="Pick a date" />
        <div className="text-sm font-medium ml-2">End Date</div>
        <DatePickerFake label="Pick a date" />
        <button className="h-10 px-3 rounded-md border bg-white">Clear Filters</button>
      </div>

      {/* метрики-строка */}
      <div className="text-xs text-gray-500 mt-3 space-y-1">
        <div>Bookings count: 19</div>
        <div>Loading state: Finished</div>
        <div>Refresh count: 0</div>
        <div>Date filter: None - None</div>
        <div>Direct query: Not run yet - Found: 0 bookings</div>
      </div>

      {/* таблица */}
      <div className="mt-4">
        <Table>
          <thead>
            <Tr>
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>Contact Method</Th>
              <Th>Service</Th>
              <Th>Status</Th>
              <Th>Created At</Th>
              <Th>Actions</Th>
            </Tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <Tr key={i}>
                <Td>{r.name}</Td>
                <Td>{r.phone}</Td>
                <Td><span className="capitalize">{r.contact}</span></Td>
                <Td>{r.service}</Td>
                <Td><Badge color={statusColor(r.status)}>{r.status}</Badge></Td>
                <Td>{r.created}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button className="rounded-md border bg-white px-3 py-1 text-sm">Status</button>
                    <button className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white">Delete</button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
