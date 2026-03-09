import { Link } from 'react-router-dom'
import { Button, Card } from '@/components'
import { customerApi } from '@/api/customerApi'
import { useQuery } from '@tanstack/react-query'
import type { Car } from '@/types'
import { formatVnd } from '@/utils/formatters'

function CarCard({ car }: { car: Car }) {
  return (
    <Card className="overflow-hidden group">
      <div className="flex">
        <div className="w-32 h-24 bg-gray-200 shrink-0 flex items-center justify-center">
          <span className="text-gray-400 text-xs">Img</span>
        </div>
        <div className="p-4 flex-1">
          <h3 className="font-semibold text-gray-900">{car.name} {car.model}</h3>
          <p className="text-lg font-bold text-[#FF6600]">{formatVnd(car.price)}</p>
          <div className="flex gap-2 mt-2">
            <Link to={`/cars/${car.id}`}>
              <Button variant="primary" size="sm">Xem</Button>
            </Link>
            <Button variant="outline" size="sm">Bỏ lưu</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function FavoritesPage() {
  const { data: cars = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => customerApi.getFavorites(),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Xe đã lưu</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
      {cars.length === 0 && (
        <p className="text-gray-500">Chưa có xe nào được lưu</p>
      )}
    </div>
  )
}
