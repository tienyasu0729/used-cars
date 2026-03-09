import { Link } from 'react-router-dom'
import { Car, MessageSquare, AlertTriangle, ArrowRight } from 'lucide-react'
import { Card, Button } from '@/components'
import { staffApi } from '@/api/staffApi'
import { useQuery } from '@tanstack/react-query'

const kpiCards = [
  { label: 'Xe chờ duyệt', key: 'pendingCarApprovals', icon: Car, path: '/staff/car-approvals', color: 'text-blue-600' },
  { label: 'Đánh giá chờ duyệt', key: 'pendingReviewApprovals', icon: MessageSquare, path: '/staff/review-approvals', color: 'text-amber-600' },
  { label: 'Báo cáo gian lận mới', key: 'newFraudReports', icon: AlertTriangle, path: '/staff/fraud-reports', color: 'text-red-600' },
]

export function StaffDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['staff-dashboard-stats'],
    queryFn: () => staffApi.getDashboardStats(),
  })

  const formatValue = (key: string) => {
    if (!stats) return '-'
    return String(stats[key as keyof typeof stats] ?? 0)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Staff Dashboard</h1>

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
            <Link to={kpi.path} className="mt-4 block">
              <Button variant="outline" size="sm" className="w-full">
                Xem chi tiết
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <ul className="space-y-3">
          <li>
            <Link
              to="/staff/car-approvals"
              className="flex items-center justify-between text-[#FF6600] hover:underline"
            >
              Duyệt tin đăng xe
              <ArrowRight className="w-4 h-4" />
            </Link>
          </li>
          <li>
            <Link
              to="/staff/review-approvals"
              className="flex items-center justify-between text-[#FF6600] hover:underline"
            >
              Kiểm duyệt đánh giá
              <ArrowRight className="w-4 h-4" />
            </Link>
          </li>
          <li>
            <Link
              to="/staff/fraud-reports"
              className="flex items-center justify-between text-[#FF6600] hover:underline"
            >
              Xem báo cáo gian lận
              <ArrowRight className="w-4 h-4" />
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  )
}
