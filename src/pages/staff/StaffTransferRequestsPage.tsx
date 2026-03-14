import { Link } from 'react-router-dom'
import { mockTransferRequests } from '@/mock'
import { mockBranches } from '@/mock'
import { Badge } from '@/components/ui'

export function StaffTransferRequestsPage() {
  const getBranchName = (id: string) => mockBranches.find((b) => b.id === id)?.name ?? id

  return (
    <div className="space-y-6">
      <Link
        to="/staff/dashboard"
        className="inline-flex items-center gap-2 rounded-xl bg-[#1A3C6E] px-5 py-2.5 font-bold text-white hover:bg-[#152d52]"
      >
        Tạo Yêu Cầu Mới
      </Link>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Xe</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Từ</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Đến</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày yêu cầu</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mockTransferRequests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-900">{t.vehicleName}</td>
                  <td className="px-6 py-4 text-sm">{getBranchName(t.fromBranchId)}</td>
                  <td className="px-6 py-4 text-sm">{getBranchName(t.toBranchId)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(t.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={t.status === 'pending' ? 'pending' : t.status === 'approved' ? 'confirmed' : 'default'}>
                      {t.status === 'pending' ? 'Chờ Duyệt' : t.status === 'approved' ? 'Đã Duyệt' : 'Từ Chối'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
