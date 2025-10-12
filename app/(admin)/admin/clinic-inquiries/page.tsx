import AdminTopbar from '@/components/admin/AdminTopbar';
import ClinicInquiriesTable, { type Row } from '@/components/admin/clinic-inquiries/ClinicInquiriesTable';
import { supabaseServer } from '@/lib/supabase/server';

const LIMIT = 15;

type Search = { page?: string; start?: string; end?: string };

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams?: Promise<Search> }) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page) || 1);
  const from = (page - 1) * LIMIT;
  const to = from + LIMIT - 1;

  const startISO = sp.start || '';
  const endISO   = sp.end || '';

  const sb = supabaseServer;

  // Читаем из MATERIALIZED VIEW с точным count
  let sel = sb
    .from('mv_clinic_inquiries' as any) // cast, т.к. типы ещё не знают про view
    .select('*', { count: 'exact', head: false });

  if (startISO) sel = sel.gte('created_at', startISO);
  if (endISO)   sel = sel.lte('created_at', endISO);

  sel = sel.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await sel;

  if (error) {
    console.error('clinic_inquiries SELECT error', error);
  }

  const rows: Row[] = (data ?? []) as any;
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="Clinic Inquiries"
        subtitle="Manage inquiries from clinics"
      />

      <ClinicInquiriesTable
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
