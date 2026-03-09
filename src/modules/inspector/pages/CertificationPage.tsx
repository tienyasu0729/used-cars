import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Card } from '@/components'
import { inspectorApi } from '@/api/inspectorApi'
import { Award, XCircle } from 'lucide-react'

export function CertificationPage() {
  const { carId } = useParams<{ carId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [hasCriticalFailures] = useState(false)

  const { data: task } = useQuery({
    queryKey: ['inspector-task', carId],
    queryFn: () => inspectorApi.getTaskById(carId!),
    enabled: !!carId,
  })

  const certifyMutation = useMutation({
    mutationFn: () => inspectorApi.certifyVehicle(carId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspector-tasks'] })
      navigate('/inspector/certified')
    },
  })

  if (!carId) return null

  const passedCount = 140
  const totalCount = 142

  return (
    <div className="p-4 pb-8">
      <h1 className="text-xl font-bold text-[#FF6600] mb-4">Chứng nhận</h1>

      <Card className="p-4 mb-4">
        <h2 className="font-semibold text-gray-900">{task?.carName ?? 'Xe'}</h2>
        <p className="text-2xl font-bold text-green-600 mt-2">{passedCount} / {totalCount} điểm đạt</p>
      </Card>

      {hasCriticalFailures && (
        <Card className="p-4 mb-4 border-red-200 bg-red-50">
          <h3 className="font-semibold text-red-800">Lỗi nghiêm trọng</h3>
          <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
            <li>Hư hỏng do ngập nước</li>
            <li>Khung xe biến dạng</li>
          </ul>
          <Button variant="danger" size="lg" className="w-full mt-4 min-h-[48px] touch-manipulation">
            <XCircle className="w-5 h-5 mr-2" />
            Từ chối cấp nhãn
          </Button>
        </Card>
      )}

      {!hasCriticalFailures && (
        <Button
          variant="primary"
          size="lg"
          className="w-full min-h-[56px] touch-manipulation text-lg bg-green-600 hover:bg-green-700"
          onClick={() => certifyMutation.mutate()}
          disabled={certifyMutation.isPending}
        >
          <Award className="w-6 h-6 mr-2" />
          Cấp nhãn SCUDN Certified
        </Button>
      )}
    </div>
  )
}
