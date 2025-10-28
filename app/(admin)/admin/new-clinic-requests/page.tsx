import NcrToolbar from '@/components/admin/new-clinic-requests/NcrToolbar'
import NcrTable from '@/components/admin/new-clinic-requests/NcrTable'
import { createServerClient } from '@/lib/supabase/serverClient'
import Link from 'next/link'

export const metadata = { title: 'New Clinic Requests — Admin' }
const PAGE_SIZE = 15

export default async function Page({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const { start, end, page: p } = await searchParams
  const page = Math.max(1, Number(p ?? '1'))

  const supabase = await createServerClient()

  // базовый запрос
  let query = supabase
    .from('new_clinic_requests')
    .select('id, created_at, clinic_name, country, city, contact_first_name, contact_last_name, email, phone, status', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page-1)*PAGE_SIZE, page*PAGE_SIZE - 1)

  // фильтр по датам
  if (start) query = query.gte('created_at', new Date(start).toISOString())
  if (end)   query = query.lte('created_at', new Date(end + 'T23:59:59').toISOString())

  const { data, count, error } = await query
  if (error) {
    return <div className="p-6 text-rose-700">Error: {error.message}</div>
  }

  const total = count ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <p className="text-sm text-gray-600">Overview</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">New Clinic Requests</h2>
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Back to Admin</Link>
      </div>

      <NcrToolbar start={start} end={end} />

      <NcrTable rows={data ?? []} />

      {/* Пагинация */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-gray-600">Total: {total}</span>
        <div className="mx-4" />
        <Pagination page={page} pages={pages} />
      </div>
    </div>
  )
}

function Pagination({ page, pages }: { page: number; pages: number }) {
  const prev = Math.max(1, page - 1)
  const next = Math.min(pages, page + 1)
  const qs = (n: number) => {
    const sp = new URLSearchParams()
    sp.set('page', String(n))
    return `?${sp.toString()}`
  }
  return (
    <div className="inline-flex overflow-hidden rounded-md border">
      <a href={qs(prev)} aria-disabled={page<=1} className={`px-3 py-1 ${page<=1?'pointer-events-none opacity-50':''}`}>Prev</a>
      <span className="border-l border-r px-3 py-1 text-sm text-gray-600">Page {page} / {pages}</span>
      <a href={qs(next)} aria-disabled={page>=pages} className={`px-3 py-1 ${page>=pages?'pointer-events-none opacity-50':''}`}>Next</a>
    </div>
  )
}
