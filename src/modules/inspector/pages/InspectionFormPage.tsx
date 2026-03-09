import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Card } from '@/components'
import { inspectorApi } from '@/api/inspectorApi'
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'

export function InspectionFormPage() {
  const { carId } = useParams<{ carId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, { pass: boolean; media: string[] }>>({})

  const { data: checklist = [] } = useQuery({
    queryKey: ['inspector-checklist'],
    queryFn: () => inspectorApi.getInspectionChecklist(),
  })

  const submitMutation = useMutation({
    mutationFn: () => {
      const arr = Object.entries(results).map(([itemId, r]) => ({ itemId, pass: r.pass, media: r.media }))
      return inspectorApi.submitInspectionChecklist(carId!, arr)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspector-tasks'] })
      navigate(`/inspector/certify/${carId}`)
    },
  })

  const setResult = (itemId: string, pass: boolean) => {
    setResults((prev) => ({ ...prev, [itemId]: { ...prev[itemId], pass, media: prev[itemId]?.media ?? [] } }))
  }

  const handleMediaCapture = (itemId: string) => {
    fileInputRef.current?.setAttribute('data-item', itemId)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const itemId = e.currentTarget.getAttribute('data-item')
    const file = e.target.files?.[0]
    if (itemId && file) {
      const url = URL.createObjectURL(file)
      setResults((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], pass: prev[itemId]?.pass ?? false, media: [...(prev[itemId]?.media ?? []), url] },
      }))
    }
    e.target.value = ''
  }

  const handleSubmit = () => {
    submitMutation.mutate()
  }

  if (!carId) return null

  return (
    <div className="p-4 pb-8">
      <h1 className="text-xl font-bold text-[#FF6600] mb-4">Kiểm tra 142 điểm</h1>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="space-y-2">
        {checklist.map((group) => (
          <Card key={group.id} className="overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
              className="w-full p-4 flex items-center justify-between text-left touch-manipulation"
            >
              <span className="font-semibold">{group.name}</span>
              {expandedGroup === group.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedGroup === group.id && (
              <div className="border-t px-4 py-3 space-y-4">
                {group.items.map((item) => (
                  <div key={item.id}>
                    <p className="text-sm font-medium">{item.label} {item.critical && <span className="text-red-500">*</span>}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={results[item.id]?.pass ? 'primary' : 'outline'}
                        size="lg"
                        className="min-h-[44px] touch-manipulation flex-1"
                        onClick={() => setResult(item.id, true)}
                      >
                        <Check className="w-5 h-5 mr-1" />
                        Pass
                      </Button>
                      <Button
                        variant={results[item.id]?.pass === false ? 'danger' : 'outline'}
                        size="lg"
                        className="min-h-[44px] touch-manipulation flex-1"
                        onClick={() => setResult(item.id, false)}
                      >
                        <X className="w-5 h-5 mr-1" />
                        Fail
                      </Button>
                    </div>
                    {results[item.id]?.pass === false && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => handleMediaCapture(item.id)}
                          className="text-sm text-[#FF6600] touch-manipulation"
                        >
                          + Chụp ảnh/video
                        </button>
                        {results[item.id]?.media?.length ? (
                          <p className="text-xs text-gray-500 mt-1">{results[item.id].media.length} file</p>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Button variant="primary" size="lg" className="w-full mt-6 min-h-[48px] touch-manipulation" onClick={handleSubmit} disabled={submitMutation.isPending}>
        Hoàn thành kiểm tra
      </Button>
    </div>
  )
}
