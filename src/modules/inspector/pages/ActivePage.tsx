import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, Card } from '@/components'
import { inspectorApi } from '@/api/inspectorApi'
import { Play } from 'lucide-react'

export function ActivePage() {
  const { data: tasks = [] } = useQuery({
    queryKey: ['inspector-tasks'],
    queryFn: () => inspectorApi.getInspectionTasks(),
  })

  const active = tasks.filter((t) => t.status === 'in_progress')

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-[#FF6600] mb-4">Đang kiểm tra</h1>
      <div className="space-y-4">
        {active.map((task) => (
          <Card key={task.id} className="p-4">
            <h3 className="font-semibold text-gray-900">{task.carName}</h3>
            <p className="text-sm text-gray-500">{task.showroomName}</p>
            <Link to={`/inspector/inspect/${task.carId}`} className="block mt-3">
              <Button variant="primary" size="lg" className="w-full touch-manipulation min-h-[44px]">
                <Play className="w-5 h-5 mr-2" />
                Tiếp tục kiểm tra
              </Button>
            </Link>
          </Card>
        ))}
      </div>
      {active.length === 0 && (
        <p className="text-center text-gray-500 py-8">Không có xe đang kiểm tra</p>
      )}
    </div>
  )
}
