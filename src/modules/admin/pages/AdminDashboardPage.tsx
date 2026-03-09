import { Link } from 'react-router-dom'
import { DollarSign, Wallet, FileCheck, ArrowRight } from 'lucide-react'
import { Card } from '@/components'
import { adminApi } from '@/api/adminApi'
import { useQuery } from '@tanstack/react-query'
import { formatVnd } from '@/utils/formatters'

const kpiCards = [
  { label: 'Tổng doanh thu hoa hồng', key: 'commissionRevenue', icon: DollarSign, color: 'text-green-600' },
  { label: 'Tổng tiền cọc đang giữ (Escrow)', key: 'escrowBalance', icon: Wallet, color: 'text-blue-600' },
  { label: 'Yêu cầu hoàn cọc chờ duyệt', key: 'pendingRefunds', icon: FileCheck, color: 'text-yellow-600' },
]

export function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminApi.getDashboardStats(),
  })

  const formatValue = (key: string) => {
    if (!stats) return '-'
    if (key === 'pendingRefunds') return String(stats.pendingRefunds)
    if (key === 'commissionRevenue') return formatVnd(stats.commissionRevenue)
    if (key === 'escrowBalance') return formatVnd(stats.escrowBalance)
    return '-'
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatValue(kpi.key)}</p>
              </div>
              <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Links</h2>
          <ul className="space-y-3">
            <li>
              <Link
                to="/admin/refund-approval"
                className="flex items-center justify-between text-[#FF6600] hover:underline"
              >
                Đến trang phê duyệt hoàn cọc
                <ArrowRight className="w-4 h-4" />
              </Link>
            </li>
            <li>
              <Link
                to="/admin/transactions"
                className="flex items-center justify-between text-[#FF6600] hover:underline"
              >
                Đến trang giao dịch
                <ArrowRight className="w-4 h-4" />
              </Link>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
