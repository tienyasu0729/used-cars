import { useState, useMemo } from 'react'
import { useActivityLogs } from '@/hooks/useActivityLogs'
import { formatLogInstant } from '@/utils/format'
import { Pagination } from '@/components/ui'

function dateToStartIso(d: string) {
  const t = d.trim()
  if (!t) return undefined
  return `${t}T00:00:00.000Z`
}

function dateToEndIso(d: string) {
  const t = d.trim()
  if (!t) return undefined
  return `${t}T23:59:59.999Z`
}

export function AdminLogsPage() {
  const [page, setPage] = useState(0)
  const [moduleFilter, setModuleFilter] = useState('')
  const [userIdFilter, setUserIdFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const size = 20

  const fromIso = useMemo(() => dateToStartIso(fromDate), [fromDate])
  const toIso = useMemo(() => dateToEndIso(toDate), [toDate])

  const { data, isLoading, isError, error, refetch } = useActivityLogs({
    page,
    size,
    module: moduleFilter.trim() || undefined,
    userId: userIdFilter.trim() || undefined,
    fromDate: fromIso,
    toDate: toIso,
    action: actionFilter.trim() || undefined,
  })

  const logs = data?.items ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  const resetPage = () => setPage(0)

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Nhật Ký Hoạt Động</h2>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Tải lại
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Module</label>
          <input
            type="search"
            placeholder="vd: users"
            value={moduleFilter}
            onChange={(e) => { setModuleFilter(e.target.value); resetPage() }}
            className="w-36 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#1A3C6E]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">User ID</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="ID"
            value={userIdFilter}
            onChange={(e) => { setUserIdFilter(e.target.value); resetPage() }}
            className="w-28 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Từ ngày</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); resetPage() }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Đến ngày</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); resetPage() }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
          />
        </div>
        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">Hành động (chứa)</label>
          <input
            type="search"
            placeholder="POST, PUT…"
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); resetPage() }}
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
          />
        </div>
      </div>
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {(error as Error)?.message || 'Không tải được nhật ký.'}
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-slate-500">Đang tải...</div>
        ) : (
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Người dùng</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Hành động</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Module</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((l) => (
                <tr key={l.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{l.user}</td>
                  <td className="px-4 py-3 text-slate-600">{l.action}</td>
                  <td className="px-4 py-3 text-slate-600">{l.module}</td>
                  <td className="px-4 py-3 text-slate-500">{formatLogInstant(l.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && logs.length === 0 && (
          <div className="py-12 text-center text-slate-500">Không có nhật ký</div>
        )}
      </div>
      <Pagination
        page={page + 1}
        totalPages={totalPages}
        total={(meta?.totalElements as number) ?? logs.length}
        pageSize={logs.length || 20}
        onPageChange={(p) => setPage(p - 1)}
        label="nhật ký"
      />
    </div>
  )
}
