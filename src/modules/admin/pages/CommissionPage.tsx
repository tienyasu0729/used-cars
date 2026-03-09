import { Card } from '@/components'
import { adminApi } from '@/api/adminApi'
import { useQuery } from '@tanstack/react-query'
import { formatVnd } from '@/utils/formatters'

export function CommissionPage() {
  const { data: commissions = [] } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: () => adminApi.getCommissions(),
  })

  const { data: summary } = useQuery({
    queryKey: ['admin-commission-summary'],
    queryFn: () => adminApi.getCommissionSummary(),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Hoa hồng</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-5">
          <p className="text-sm text-gray-500">Hoa hồng hôm nay</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {summary ? formatVnd(summary.today) : '-'}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-500">Hoa hồng tháng này</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {summary ? formatVnd(summary.thisMonth) : '-'}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FF6600] text-white">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Mã bán</th>
              <th className="text-left px-4 py-3 font-medium">Showroom</th>
              <th className="text-left px-4 py-3 font-medium">Xe</th>
              <th className="text-left px-4 py-3 font-medium">Giá bán</th>
              <th className="text-left px-4 py-3 font-medium">Tỷ lệ %</th>
              <th className="text-left px-4 py-3 font-medium">Hoa hồng</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.saleId} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.saleId}</td>
                <td className="px-4 py-3 text-gray-600">{c.showroom}</td>
                <td className="px-4 py-3 text-gray-600">{c.car}</td>
                <td className="px-4 py-3">{formatVnd(c.salePrice)}</td>
                <td className="px-4 py-3">{c.commissionRate}%</td>
                <td className="px-4 py-3 font-medium">{formatVnd(c.commissionAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
