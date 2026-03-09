import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Modal, CarImage } from '@/components'
import { staffApi } from '@/api/staffApi'
import { mockCars } from '@/mock/mockCars'
import { formatVnd } from '@/utils/formatters'
import { Trash2, Loader2 } from 'lucide-react'

export function HotCarsPage() {
  const queryClient = useQueryClient()
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [carToRemove, setCarToRemove] = useState<{ id: string; name: string; model: string } | null>(null)

  const { data: hotIds = [] } = useQuery({
    queryKey: ['staff-hot-cars'],
    queryFn: () => staffApi.getHotCars(),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => staffApi.removeHotCar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-hot-cars'] })
      setShowRemoveModal(false)
      setCarToRemove(null)
    },
  })

  const openRemoveModal = (car: { id: string; name: string; model: string }) => {
    setCarToRemove(car)
    setShowRemoveModal(true)
  }

  const confirmRemove = () => {
    if (carToRemove) removeMutation.mutate(carToRemove.id)
  }

  const addMutation = useMutation({
    mutationFn: (carId: string) => staffApi.addHotCar(carId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-hot-cars'] }),
  })

  const hotCars = mockCars.filter((c) => hotIds.includes(c.id))
  const availableCars = mockCars.filter((c) => !hotIds.includes(c.id))

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Xe nổi bật (Hot)</h1>

      <div className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Xe đang ghim</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotCars.map((car) => (
            <Card key={car.id} className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-16 rounded shrink-0 overflow-hidden">
                  <CarImage car={car} aspectRatio="fill" className="h-full w-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{car.name} {car.model}</h3>
                  <p className="text-sm text-[#FF6600] font-semibold">{formatVnd(car.price)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => openRemoveModal(car)} disabled={removeMutation.isPending}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal open={showRemoveModal} onClose={() => setShowRemoveModal(false)} title="Xóa xe khỏi Hot">
        <p className="text-gray-600 mb-4">
          Bạn có chắc muốn xóa {carToRemove?.name} {carToRemove?.model} khỏi danh sách Hot?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowRemoveModal(false)} disabled={removeMutation.isPending}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmRemove} disabled={removeMutation.isPending}>
            {removeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Xóa khỏi Hot
          </Button>
        </div>
      </Modal>

      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Thêm xe vào Hot</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableCars.slice(0, 6).map((car) => (
            <Card key={car.id} className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-16 rounded shrink-0 overflow-hidden">
                  <CarImage car={car} aspectRatio="fill" className="h-full w-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{car.name} {car.model}</h3>
                  <p className="text-sm text-gray-500">{formatVnd(car.price)}</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => addMutation.mutate(car.id)}
                  disabled={addMutation.isPending}
                >
                  Thêm
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
