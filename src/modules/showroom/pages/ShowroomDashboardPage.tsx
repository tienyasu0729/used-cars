import { Link } from 'react-router-dom'
import { Eye, Calendar, QrCode, TrendingUp, ArrowRight } from 'lucide-react'
import { Card } from '@/components'
import { showroomApi } from '@/api/showroomApi'
import { useQuery } from '@tanstack/react-query'

const kpiCards = [
  { label: 'Lượt xem tuần', key: 'weeklyViews', icon: Eye, color: 'text-blue-600' },
  { label: 'Lịch hẹn chờ xử lý', key: 'pendingAppointments', icon: Calendar, color: 'text-amber-600' },
  { label: 'Quét QR thành công', key: 'qrScans', icon: QrCode, color: 'text-green-600' },
  { label: 'Tỷ lệ chuyển đổi (%)', key: 'conversionRate', icon: TrendingUp, color: 'text-[#FF6600]' },
]

export function ShowroomDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['showroom-dashboard-stats'],
    queryFn: () => showroomApi.getDashboardStats(),
  })

  const formatValue = (key: string) => {
    if (!stats) return '-'
    const v = stats[key as keyof typeof stats]
    return typeof v === 'number' ? (key === 'conversionRate' ? `${v}%` : String(v)) : '-'
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <h2 className="font-semibold text-gray-900 mb-4">Lịch hẹn theo tuần</h2>
          <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">Biểu đồ (chart)</div>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tỷ lệ chuyển đổi</h2>
          <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">Biểu đồ (chart)</div>
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Links</h2>
        <ul className="space-y-3">
          <li>
            <Link to="/showroom/appointments" className="flex items-center justify-between text-[#FF6600] hover:underline">
              Quản lý lịch hẹn
              <ArrowRight className="w-4 h-4" />
            </Link>
          </li>
          <li>
            <Link to="/showroom/inventory" className="flex items-center justify-between text-[#FF6600] hover:underline">
              Kho xe
              <ArrowRight className="w-4 h-4" />
            </Link>
          </li>
          <li>
            <Link to="/showroom/transactions" className="flex items-center justify-between text-[#FF6600] hover:underline">
              Giao dịch
              <ArrowRight className="w-4 h-4" />
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  )
}
