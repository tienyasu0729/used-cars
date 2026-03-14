import { SavedVehicleGrid } from '@/features/customer/components/SavedVehicleGrid'
import { useSavedVehicles } from '@/hooks/useSavedVehicles'

export function SavedVehiclesPage() {
  const { data: vehicles, isLoading, isError } = useSavedVehicles()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Xe Đã Lưu</h1>
        <p className="mt-1 text-slate-500">
          {vehicles?.length ?? 0} xe đã lưu trong danh sách yêu thích
        </p>
      </div>
      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Không thể tải xe đã lưu. Vui lòng thử lại.
        </div>
      ) : (
        <SavedVehicleGrid vehicles={vehicles ?? []} isLoading={isLoading} />
      )}
    </div>
  )
}
