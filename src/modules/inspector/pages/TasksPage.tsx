import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, Card } from '@/components'
import { inspectorApi } from '@/api/inspectorApi'
import { MapPin, Play, Camera } from 'lucide-react'

const statusLabels: Record<string, string> = {
  waiting: 'Chờ kiểm tra',
  in_progress: 'Đang kiểm tra',
  completed: 'Hoàn thành',
}

export function TasksPage() {
  const { data: tasks = [] } = useQuery({
    queryKey: ['inspector-tasks'],
    queryFn: () => inspectorApi.getInspectionTasks(),
  })

  const waiting = tasks.filter((t) => t.status === 'waiting' || t.status === 'in_progress')

  const openMaps = (lat?: number, lng?: number) => {
    if (lat != null && lng != null) {
      window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank')
    } else {
      window.open('https://maps.google.com/', '_blank')
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-[#FF6600] mb-4">Nhiệm vụ kiểm tra</h1>
      <div className="space-y-4">
        {waiting.map((task) => (
          <Card key={task.id} className="p-4">
            <h3 className="font-semibold text-gray-900">{task.carName}</h3>
            <p className="text-sm text-gray-500 mt-1">{task.showroomName}</p>
            <p className="text-sm text-gray-600 mt-1">{task.appointmentTime}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100">{statusLabels[task.status]}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => openMaps(task.lat, task.lng)}
                className="flex items-center gap-1 text-sm text-[#FF6600] touch-manipulation"
              >
                <MapPin className="w-4 h-4" />
                Mở Google Maps
              </button>
              {task.status === 'waiting' && (
                <Link to={`/inspector/verify-images/${task.carId}`} className="flex items-center gap-1 text-sm text-gray-600 touch-manipulation">
                  <Camera className="w-4 h-4" />
                  Verify ảnh
                </Link>
              )}
            </div>
            {task.status === 'waiting' && (
              <Link to={`/inspector/inspect/${task.carId}`} className="block mt-3">
                <Button variant="primary" size="lg" className="w-full touch-manipulation min-h-[44px]">
                  <Play className="w-5 h-5 mr-2" />
                  Bắt đầu kiểm tra
                </Button>
              </Link>
            )}
          </Card>
        ))}
      </div>
      {waiting.length === 0 && (
        <p className="text-center text-gray-500 py-8">Không có nhiệm vụ chờ kiểm tra</p>
      )}
    </div>
  )
}
