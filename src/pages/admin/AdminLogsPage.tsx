import { useActivityLogs } from '@/hooks/useActivityLogs'

export function AdminLogsPage() {
  const { data: logs, isLoading } = useActivityLogs()

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Nhật Ký Hoạt Động</h2>
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
              {logs?.map((l: { id: string; user: string; action: string; module: string; timestamp: string }) => (
                <tr key={l.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{l.user}</td>
                  <td className="px-4 py-3 text-slate-600">{l.action}</td>
                  <td className="px-4 py-3 text-slate-600">{l.module}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(l.timestamp).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && (!logs || logs.length === 0) && (
          <div className="py-12 text-center text-slate-500">Không có nhật ký</div>
        )}
      </div>
    </div>
  )
}
