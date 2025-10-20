import ReportsTable, { type ReportRow } from '@/components/admin/reports/ReportsTable'
import ReportsToolbar from '@/components/admin/reports/ReportsToolbar'
import { supabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 15

function addDays(d: Date, days: number) {
  const dd = new Date(d)
  dd.setDate(dd.getDate() + days)
  return dd
}
function toISO(d: Date) {
  return d.toISOString()
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ start?: string; end?: string; page?: string }>
}) {
  const sp = (await searchParams) ?? {}
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  const startParam = sp.start?.trim()
  const endParam = sp.end?.trim()

  let startISO: string | undefined
  let endISOExclusive: string | undefined

  if (startParam) {
    const s = new Date(`${startParam}T00:00:00`)
    if (!isNaN(s.getTime())) startISO = toISO(s)
  }
  if (endParam) {
    const e = new Date(`${endParam}T00:00:00`)
    if (!isNaN(e.getTime())) endISOExclusive = toISO(addDays(e, 1))
  }

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // подтянем имя клиники через join на v/mv или прямой select с subquery
  // здесь используем subquery select
  let query = supabaseServer
    .from('reports')
    .select(`
      id, name, email, phone, relationship, message, status, created_at,
      clinic:clinic_id ( name )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (startISO) query = query.gte('created_at', startISO)
  if (endISOExclusive) query = query.lt('created_at', endISOExclusive)

  const { data, error, count } = await query.range(from, to)

  const rows: ReportRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    clinic_name: r.clinic?.name ?? null,
    name: r.name,
    email: r.email,
    phone: r.phone,
    relationship: r.relationship,
    message: r.message,
    status: r.status,
    created_at: r.created_at,
  }))

  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const mkHref = (p: number) => {
    const params = new URLSearchParams()
    if (startParam) params.set('start', startParam)
    if (endParam) params.set('end', endParam)
    params.set('page', String(p))
    return `/admin/reports?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-gray-500">User-submitted issues about clinic listings</p>
      </div>

      <ReportsToolbar start={startParam} end={endParam} />

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-rose-700">
          Failed to load: {error.message}
        </div>
      ) : (
        <>
          <ReportsTable rows={rows} />

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-500">Total: {total} • Page {page} / {totalPages}</div>

            <div className="flex items-center gap-2">
              <Link
                aria-disabled={page <= 1}
                className={`rounded-md border px-3 py-1.5 ${page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
                href={mkHref(Math.max(1, page - 1))}
              >
                Prev
              </Link>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                  const p = i + 1
                  return (
                    <Link
                      key={p}
                      href={mkHref(p)}
                      className={`rounded-md px-3 py-1.5 border ${p === page ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-50'}`}
                    >
                      {p}
                    </Link>
                  )
                })}
                {totalPages > 7 && (
                  <>
                    <span className="px-1">…</span>
                    <Link
                      href={mkHref(totalPages)}
                      className={`rounded-md px-3 py-1.5 border ${page === totalPages ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-50'}`}
                    >
                      {totalPages}
                    </Link>
                  </>
                )}
              </div>

              <Link
                aria-disabled={page >= totalPages}
                className={`rounded-md border px-3 py-1.5 ${page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
                href={mkHref(Math.min(totalPages, page + 1))}
              >
                Next
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
