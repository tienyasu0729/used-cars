import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Badge, Modal } from '@/components'
import { staffApi } from '@/api/staffApi'
import { Eye, CheckCircle } from 'lucide-react'
import { Loader2 } from 'lucide-react'

interface FraudReport {
  id: string
  showroom: string
  issueType: string
  evidence: string[]
  status: string
  reportedAt: string
}

export function FraudReportsPage() {
  const queryClient = useQueryClient()
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<FraudReport | null>(null)

  const { data: reports = [] } = useQuery({
    queryKey: ['staff-fraud-reports'],
    queryFn: () => staffApi.getFraudReports(),
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => staffApi.resolveFraudReport(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-fraud-reports'] }),
  })

  const statusVariant = (s: string) => (s === 'resolved' ? 'success' : s === 'investigating' ? 'warning' : 'default')

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Báo cáo gian lận</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">Report ID</th>
              <th className="text-left py-3 px-4">Showroom</th>
              <th className="text-left py-3 px-4">Loại vấn đề</th>
              <th className="text-left py-3 px-4">Bằng chứng</th>
              <th className="text-left py-3 px-4">Trạng thái</th>
              <th className="text-left py-3 px-4">Ngày báo</th>
              <th className="text-left py-3 px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{r.id}</td>
                <td className="py-3 px-4">{r.showroom}</td>
                <td className="py-3 px-4">{r.issueType}</td>
                <td className="py-3 px-4">{r.evidence.length} file</td>
                <td className="py-3 px-4">
                  <Badge variant={statusVariant(r.status)}>
                    {r.status === 'pending' ? 'Chờ xử lý' : r.status === 'investigating' ? 'Đang điều tra' : 'Đã xử lý'}
                  </Badge>
                </td>
                <td className="py-3 px-4">{r.reportedAt}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {r.status !== 'resolved' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(r)
                          setShowResolveModal(true)
                        }}
                        disabled={resolveMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reports.length === 0 && (
        <Card className="p-8 text-center text-gray-500 mt-4">Không có báo cáo gian lận</Card>
      )}

      <Modal open={showResolveModal} onClose={() => setShowResolveModal(false)} title="Đánh dấu đã xử lý">
        <p className="text-gray-600 mb-4">
          Bạn có chắc muốn đánh dấu báo cáo {selectedReport?.id} ({selectedReport?.showroom}) là đã xử lý?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowResolveModal(false)} disabled={resolveMutation.isPending}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={() => selectedReport && resolveMutation.mutate(selectedReport.id)}
            disabled={resolveMutation.isPending}
          >
            {resolveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Đã xử lý
          </Button>
        </div>
      </Modal>
    </div>
  )
}
