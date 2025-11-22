// app/(admin)/admin/clinic-requests/page.tsx
import { supabaseServer } from '@/lib/supabase/server'
import ClinicRequestsTable, { type Row } from '@/components/admin/clinic-requests/ClinicRequestsTable'
import ClinicRequestsToolbar from '@/components/admin/clinic-requests/ClinicRequestsToolbar'
import Link from 'next/link'
import {
  updateClinicRequestStatusAction,
  deleteClinicRequestAction,
  deleteAllClinicRequestsAction,
} from './actions'

export const dynamic = 'force-dynamic'
const PAGE_SIZE = 15

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ start?: string; end?: string; page?: string }>
}) {
  const sp = (await searchParams) ?? {}
  const page = Math.max(1, Number(sp.page) || 1)

  const startParam = sp.start?.trim()
  const endParam = sp.end?.trim()

  let startISO: string | undefined
  let endISOExclusive: string | undefined
  if (startParam) startISO = new Date(`${startParam}T00:00:00`).toISOString()
  if (endParam) endISOExclusive = new Date(`${endParam}T23:59:59.999Z`).toISOString()

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // основная выборка + название клиники + название услуги
  let q = supabaseServer
    .from('clinic_requests' as any)
    .select(
      `
        id,
        clinic_id,
        service_id,
        doctor_id,
        name,
        phone,
        contact_method,
        status,
        created_at,
        clinics:clinics!inner(id,name),
        service:public_services(id,name)
      `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (startISO) q = q.gte('created_at', startISO)
  if (endISOExclusive) q = q.lte('created_at', endISOExclusive)

  const { data, error, count } = await q

  const rows = (data ?? []) as Row[]
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const onChangeStatus = async (id: string, status: Row['status']) => {
    'use server'
    await updateClinicRequestStatusAction(id, status ?? 'New')
  }
  const onDelete = async (id: string) => {
    'use server'
    await deleteClinicRequestAction(id)
  }
  const onDeleteAll = async () => {
    'use server'
    await deleteAllClinicRequestsAction()
  }

  const mkHref = (p: number) => {
    const params = new URLSearchParams()
    if (startParam) params.set('start', startParam)
    if (endParam) params.set('end', endParam)
    params.set('page', String(p))
    return `/admin/clinic-requests?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Clinic Requests</h1>
        <p className="text-sm text-gray-500">Requests sent from clinic pages</p>
      </div>

      <ClinicRequestsToolbar start={startParam} end={endParam} />

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-rose-700">
          Failed to load: {error.message}
        </div>
      ) : (
        <>
          <ClinicRequestsTable
            rows={rows}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            onChangeStatus={onChangeStatus}
            onDelete={onDelete}
            onDeleteAll={onDeleteAll}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              Total: {total} • Page {page} / {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <Link
                aria-disabled={page <= 1}
                className={`rounded-md border px-3 py-1.5 ${
                  page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'
                }`}
                href={mkHref(Math.max(1, page - 1))}
              >
                Prev
              </Link>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  const p = i + 1
                  return (
                    <Link
                      key={p}
                      href={mkHref(p)}
                      className={`rounded-md px-3 py-1.5 border ${
                        p === page
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'hover:bg-gray-50'
                      }`}
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
                      className={`rounded-md px-3 py-1.5 border ${
                        page === totalPages
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {totalPages}
                    </Link>
                  </>
                )}
              </div>

              <Link
                aria-disabled={page >= totalPages}
                className={`rounded-md border px-3 py-1.5 ${
                  page >= totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'hover:bg-gray-50'
                }`}
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
