import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components'
import { inspectorApi } from '@/api/inspectorApi'
import { Award } from 'lucide-react'

export function CertifiedPage() {
  const { data: tasks = [] } = useQuery({
    queryKey: ['inspector-tasks'],
    queryFn: () => inspectorApi.getInspectionTasks(),
  })

  const certified = tasks.filter((t) => t.status === 'completed')

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-[#FF6600] mb-4">Đã chứng nhận</h1>
      <div className="space-y-4">
        {certified.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">{task.carName}</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">{task.showroomName}</p>
            <p className="text-sm text-gray-600 mt-1">{task.appointmentTime}</p>
            <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">SCUDN Certified</span>
          </Card>
        ))}
      </div>
      {certified.length === 0 && (
        <p className="text-center text-gray-500 py-8">Chưa có xe được chứng nhận</p>
      )}
    </div>
  )
}
