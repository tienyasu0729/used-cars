/**
 * RecentlyViewedWidget — danh sách ngang xe vừa xem
 */
import { Link } from 'react-router-dom'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { formatPrice } from '@/utils/format'

interface RecentlyViewedWidgetProps {
  maxItems?: number
}

export function RecentlyViewedWidget({ maxItems = 6 }: RecentlyViewedWidgetProps) {
  const { recentVehicles, isLoading } = useRecentlyViewed()
  const slice = recentVehicles.slice(0, maxItems)

  if (!isLoading && slice.length === 0) {
    return null
  }

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Xe bạn đã xem</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 w-48 shrink-0 animate-pulse rounded-lg bg-slate-200" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold text-slate-900">Xe bạn đã xem</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {slice.map((v) => {
          const img =
            v.images?.[0]?.url ?? 'https://placehold.co/400x240?text=No+Image'
          return (
            <Link
              key={v.id}
              to={`/vehicles/${v.id}`}
              className="w-48 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="h-28 overflow-hidden bg-slate-100">
                <img src={img} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="p-2">
                <p className="line-clamp-2 text-xs font-medium text-slate-900">{v.title}</p>
                <p className="mt-1 text-sm font-bold text-[#1A3C6E]">{formatPrice(v.price)}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
