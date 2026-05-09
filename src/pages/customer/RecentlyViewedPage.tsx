// Trang hiển thị toàn bộ lịch sử xe đã xem của khách hàng
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { DashboardOverviewCard } from '@/features/customer/components/DashboardOverviewCard'
import { EmptyState, Button } from '@/components/ui'

export function RecentlyViewedPage() {
  // Lấy toàn bộ xe đã xem (truyền 0 = không giới hạn)
  const { data: recentVehicles = [], isLoading } = useRecentlyViewed(0)

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/dashboard" className="transition-colors hover:text-[#1A3C6E]">
          Bảng điều khiển
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-900">Xe đã xem</span>
      </nav>

      {/* Tiêu đề */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Xe đã xem gần đây</h1>
        <p className="mt-1 text-sm text-slate-500">
          Danh sách các xe bạn đã xem chi tiết, sắp xếp theo thời gian gần nhất.
        </p>
      </div>

      {/* Nội dung chính */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : recentVehicles.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="Chưa có xe nào được xem"
          description="Hãy duyệt danh sách xe và xem chi tiết để lịch sử hiển thị tại đây."
          actionButton={
            <Link to="/vehicles">
              <Button variant="accent">Xem danh sách xe</Button>
            </Link>
          }
        />
      ) : (
        <>
          <p className="text-sm text-slate-500">
            Hiển thị {recentVehicles.length} xe đã xem
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentVehicles.map((v, i) => (
              <DashboardOverviewCard key={`recent-${v.id}-${i}`} vehicle={v} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
