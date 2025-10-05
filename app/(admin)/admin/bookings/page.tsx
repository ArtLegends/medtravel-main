// app/(admin)/admin/bookings/page.tsx
import AdminTopbar from '@/components/admin/AdminTopbar';
import DatePickerFake from '@/components/admin/DatePickerFake';
import { Table, Th, Tr, Td } from '@/components/admin/Table';
import Badge from '@/components/admin/Badge';
import { createClient } from '@supabase/supabase-js';

type Row = {
  id: string;
  name: string;
  phone: string;
  contact_method: 'email' | 'phone' | 'whatsapp' | 'telegram' | string;
  service: string;
  status: 'New' | 'Processed' | 'Rejected' | string;
  created_at: string;
};

function statusColor(s: string): 'green' | 'blue' | 'red' | 'gray' {
  if (s === 'Processed') return 'green';
  if (s === 'New') return 'blue';
  if (s === 'Rejected') return 'red';
  return 'gray';
}

async function getRows(): Promise<Row[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
  );
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Bookings fetch error:', error);
    return [];
  }
  return (data ?? []) as Row[];
}

export default async function Page() {
  const rows = await getRows();
  const count = rows.length;

  return (
    <>
      <AdminTopbar title="Bookings" subtitle="Manage booking requests from customers" />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="text-sm font-medium">Start Date</div>
        <DatePickerFake label="Pick a date" />
        <div className="text-sm font-medium ml-2">End Date</div>
        <DatePickerFake label="Pick a date" />
        <button className="h-10 px-3 rounded-md border bg-white">Clear Filters</button>
      </div>

      <div className="text-xs text-gray-500 mt-3 space-y-1">
        <div>Bookings count: {count}</div>
        <div>Loading state: Finished</div>
        <div>Refresh count: 0</div>
        <div>Date filter: None - None</div>
        <div>Direct query: Supabase - Found: {count} bookings</div>
      </div>

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
            {rows.map((r) => (
              <Tr key={r.id}>
                <Td>{r.name}</Td>
                <Td>{r.phone}</Td>
                <Td><span className="capitalize">{r.contact_method}</span></Td>
                <Td>{r.service}</Td>
                <Td><Badge color={statusColor(r.status)}>{r.status}</Badge></Td>
                <Td>{new Date(r.created_at).toLocaleString()}</Td>
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
