import ContactsTable, { type ContactRow } from '@/components/admin/contacts/ContactsTable';
import { supabaseServer } from '@/lib/supabase/server';

export const metadata = { title: 'Contacts • Admin' };
export const dynamic = 'force-dynamic';

const LIMIT = 15;
type Search = { page?: string; start?: string; end?: string };

export default async function ContactsPage({ searchParams }: { searchParams?: Promise<Search> }) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page) || 1);
  const from = (page - 1) * LIMIT;
  const to   = from + LIMIT - 1;

  const startISO = sp.start || '';
  const endISO   = sp.end || '';

  const sb = supabaseServer;

  let sel = sb
    .from('contact_messages' as any)
    .select('id, first_name, last_name, email, phone, created_at, status', { count: 'exact', head: false });

  if (startISO) sel = sel.gte('created_at', startISO);
  if (endISO)   sel = sel.lte('created_at', endISO);

  sel = sel.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await sel;
  if (error) console.error('contact_messages SELECT error:', error);

  const rows: ContactRow[] = (data ?? []) as any;
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Contacts</h1>
      <ContactsTable
        rows={rows}
        total={total}
        page={page}
        pages={pages}
        start={startISO}
        end={endISO}
        limit={LIMIT}
      />
    </div>
  );
}
