import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, Card } from '@/components'
import { inspectorApi } from '@/api/inspectorApi'
import { Check, X } from 'lucide-react'

export function ImageVerificationPage() {
  const { carId } = useParams<{ carId: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [capturedUrls, setCapturedUrls] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flagged, setFlagged] = useState(false)

  const { data: images = [] } = useQuery({
    queryKey: ['inspector-showroom-images', carId],
    queryFn: () => inspectorApi.getShowroomImages(carId!),
    enabled: !!carId,
  })

  const handleCapture = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCapturedUrls((prev) => [...prev, url])
    }
    e.target.value = ''
  }

  const handleMatch = async (match: boolean) => {
    if (carId) {
      await inspectorApi.verifyImageMatch(carId, currentIndex, match)
      if (!match) setFlagged(true)
      if (currentIndex < images.length - 1) {
        setCurrentIndex((i) => i + 1)
      } else {
        navigate(`/inspector/inspect/${carId}`)
      }
    }
  }

  if (!carId) return null

  return (
    <div className="p-4 pb-8">
      <h1 className="text-xl font-bold text-[#FF6600] mb-4">Xác minh ảnh</h1>

      <div className="space-y-4">
        <Card className="p-4">
          <h2 className="font-semibold text-gray-900 mb-2">Ảnh showroom đã tải</h2>
          <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-500 text-sm">Ảnh {currentIndex + 1}/{images.length}</span>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold text-gray-900 mb-2">Chụp ảnh thực tế</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleCapture}
            className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 touch-manipulation min-h-[120px]"
          >
            {capturedUrls[currentIndex] ? 'Đã chụp' : 'Chạm để chụp'}
          </button>
        </Card>

        {flagged && (
          <p className="text-red-600 text-sm font-medium">Đã đánh dấu sai lệch - cần xem xét</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button variant="primary" size="lg" className="min-h-[48px] touch-manipulation" onClick={() => handleMatch(true)}>
            <Check className="w-5 h-5 mr-2" />
            Khớp
          </Button>
          <Button variant="danger" size="lg" className="min-h-[48px] touch-manipulation" onClick={() => handleMatch(false)}>
            <X className="w-5 h-5 mr-2" />
            Sai lệch
          </Button>
        </div>
      </div>
    </div>
  )
}
