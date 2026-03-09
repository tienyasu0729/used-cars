import React, { useState, useMemo, useCallback } from 'react'
import { Plus, Search, LayoutGrid, List, Pencil, Trash2, Star, Package } from 'lucide-react'
import { Button, Card, Badge, Modal, PaginationBar } from '@/components'
import { Loader2 } from 'lucide-react'
import { showroomApi } from '@/api/showroomApi'
import { carsApi } from '@/api/carsApi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { formatVnd } from '@/utils/formatters'
import type { Car } from '@/types'
import { usePagination } from '@/hooks/usePagination'

const statusOptions: { value: Car['status']; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'viewing', label: 'Reserved' },
  { value: 'sold_offline', label: 'Sold Offline' },
  { value: 'deposit', label: 'Đã cọc' },
  { value: 'sold', label: 'Sold' },
]

const CarListingCard = React.memo(function CarListingCard({
  car,
  onStatusChange,
  onDelete,
}: {
  car: Car
  onStatusChange: (id: string, s: Car['status']) => void
  onDelete: (car: Car) => void
}) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Car Image</span>
        </div>
        <div className="absolute bottom-2 right-2">
          <Badge variant="primary">{car.views ?? 0} views</Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{car.name} {car.model}</h3>
        <p className="text-[#FF6600] font-bold text-lg mt-1">{formatVnd(car.price)}</p>
        <p className="text-sm text-gray-500">Năm: {car.year}</p>
        <div className="mt-3">
          <select
            value={car.status}
            onChange={(e) => onStatusChange(car.id, e.target.value as Car['status'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <Button variant="outline" size="sm" className="flex-1">
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-amber-600 border-amber-600">
            <Star className="w-4 h-4 mr-1" />
            Đẩy tin nổi bật
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(car)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
    </Card>
  )
})

export function InventoryPage() {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [carToDelete, setCarToDelete] = useState<Car | null>(null)

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['showroom-inventory'],
    queryFn: () => showroomApi.getInventory(),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => showroomApi.updateCarStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['showroom-inventory'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => carsApi.deleteCar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showroom-inventory'] })
      setShowDeleteModal(false)
      setCarToDelete(null)
    },
  })

  const handleStatusChange = useCallback(
    (id: string, status: string) => statusMutation.mutate({ id, status }),
    [statusMutation]
  )

  const openDeleteModal = useCallback((car: Car) => {
    setCarToDelete(car)
    setShowDeleteModal(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (carToDelete) deleteMutation.mutate(carToDelete.id)
  }, [carToDelete, deleteMutation])

  const filteredCars = useMemo(
    () =>
      cars.filter((car) => {
        const matchStatus = statusFilter === 'all' || car.status === statusFilter
        const matchSearch =
          !searchQuery ||
          car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (car.model || '').toLowerCase().includes(searchQuery.toLowerCase())
        return matchStatus && matchSearch
      }),
    [cars, statusFilter, searchQuery]
  )

  const { page, setPage, paginated: paginatedCars, totalPages, pageNumbers, rangeText } = usePagination({
    items: filteredCars,
    pageSize: 12,
  })

  const stats = useMemo(
    () => ({
      total: cars.length,
      available: cars.filter((c) => c.status === 'available').length,
      viewing: cars.filter((c) => c.status === 'viewing').length,
      sold: cars.filter((c) => ['sold', 'sold_offline', 'deposit'].includes(c.status)).length,
    }),
    [cars]
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Kho xe của tôi</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Available</p>
          <p className="text-2xl font-bold text-green-600">{stats.available}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Reserved</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.viewing}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Sold</p>
          <p className="text-2xl font-bold text-gray-600">{stats.sold}</p>
        </Card>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button variant={viewMode === 'grid' ? 'primary' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'primary' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-1 md:justify-end gap-4 w-full md:w-auto">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="all">All Statuses</option>
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <Link to="/showroom/add-car">
              <Button variant="primary" size="md">
                <Plus className="w-4 h-4 mr-2 inline" />
                Add New Car
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Xóa xe">
        <p className="text-gray-600 mb-4">
          Bạn có chắc muốn xóa xe {carToDelete?.name} {carToDelete?.model} khỏi kho?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteMutation.isPending}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Xóa
          </Button>
        </div>
      </Modal>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : filteredCars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Không tìm thấy dữ liệu phù hợp</p>
          <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc thêm xe mới</p>
          <Link to="/showroom/add-car" className="mt-4">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4 mr-2 inline" />
              Thêm xe
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCars.map((car) => (
              <CarListingCard key={car.id} car={car} onStatusChange={handleStatusChange} onDelete={openDeleteModal} />
            ))}
          </div>
          {totalPages > 1 && (
            <PaginationBar
              rangeText={rangeText}
              page={page}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              onPageChange={setPage}
              align="right"
            />
          )}
        </>
      )}
    </div>
  )
}
