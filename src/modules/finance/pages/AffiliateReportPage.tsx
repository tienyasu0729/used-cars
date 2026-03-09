import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Modal } from '@/components'
import { financeApi } from '@/api/financeApi'
import { formatVnd } from '@/utils/formatters'
import { Loader2 } from 'lucide-react'

interface Contract {
  id: string
  customer: string
  car: string
  loanAmount: number
  status: string
  commissionAmount?: number
  commissionRate?: number
}

export function AffiliateReportPage() {
  const queryClient = useQueryClient()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

  const { data: contracts = [] } = useQuery({
    queryKey: ['finance-affiliate-reports'],
    queryFn: () => financeApi.getAffiliateReports(),
  })

  const confirmMutation = useMutation({
    mutationFn: (id: string) => financeApi.confirmLoanDisbursement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-affiliate-reports'] })
      setShowConfirmModal(false)
      setSelectedContract(null)
    },
  })

  const totalCommission = contracts
    .filter((c) => c.status === 'disbursed' && c.commissionAmount)
    .reduce((sum, c) => sum + (c.commissionAmount ?? 0), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Đối soát Hoa hồng</h1>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-2">Tổng hoa hồng SCUDN</h2>
        <p className="text-2xl font-bold text-[#FF6600]">{formatVnd(totalCommission)}</p>
      </Card>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">Contract ID</th>
              <th className="text-left py-3 px-4">Khách hàng</th>
              <th className="text-left py-3 px-4">Xe</th>
              <th className="text-left py-3 px-4">Giá trị vay</th>
              <th className="text-left py-3 px-4">Trạng thái</th>
              <th className="text-left py-3 px-4">Hoa hồng</th>
              <th className="text-left py-3 px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{c.id}</td>
                <td className="py-3 px-4">{c.customer}</td>
                <td className="py-3 px-4">{c.car}</td>
                <td className="py-3 px-4">{formatVnd(c.loanAmount)}</td>
                <td className="py-3 px-4">{c.status === 'disbursed' ? 'Đã giải ngân' : 'Chờ giải ngân'}</td>
                <td className="py-3 px-4">
                  {c.commissionAmount ? formatVnd(c.commissionAmount) : `${c.commissionRate}%`}
                </td>
                <td className="py-3 px-4">
                  {c.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedContract(c)
                        setShowConfirmModal(true)
                      }}
                      disabled={confirmMutation.isPending}
                    >
                      {confirmMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
                      Xác nhận đã giải ngân
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {contracts.length === 0 && (
        <Card className="p-8 text-center text-gray-500 mt-4">Chưa có hợp đồng</Card>
      )}

      <Modal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Xác nhận đã giải ngân">
        <p className="text-gray-600 mb-4">
          Bạn có chắc đã giải ngân cho hợp đồng {selectedContract?.id} - {selectedContract?.customer}?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={confirmMutation.isPending}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={() => selectedContract && confirmMutation.mutate(selectedContract.id)}
            disabled={confirmMutation.isPending}
          >
            {confirmMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Xác nhận
          </Button>
        </div>
      </Modal>
    </div>
  )
}
