import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Modal } from '@/components'
import { showroomApi } from '@/api/showroomApi'
import { formatVnd } from '@/utils/formatters'
import { Loader2 } from 'lucide-react'

interface Transaction {
  id: string
  customer: string
  car: string
  depositAmount: number
  status: string
}

export function TransactionsPage() {
  const queryClient = useQueryClient()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  const { data: transactions = [] } = useQuery({
    queryKey: ['showroom-transactions'],
    queryFn: () => showroomApi.getTransactions(),
  })

  const confirmMutation = useMutation({
    mutationFn: (id: string) => showroomApi.confirmSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showroom-transactions'] })
      setShowConfirmModal(false)
      setSelectedTx(null)
    },
  })

  const statusLabels: Record<string, string> = {
    deposit_received: 'Đã nhận cọc',
    sale_confirmed: 'Đã xác nhận bán',
    commission_deducted: 'Đã trừ hoa hồng',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Giao dịch & Hoa hồng</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">Transaction ID</th>
              <th className="text-left py-3 px-4">Khách hàng</th>
              <th className="text-left py-3 px-4">Xe</th>
              <th className="text-left py-3 px-4">Tiền cọc</th>
              <th className="text-left py-3 px-4">Trạng thái</th>
              <th className="text-left py-3 px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{tx.id}</td>
                <td className="py-3 px-4">{tx.customer}</td>
                <td className="py-3 px-4">{tx.car}</td>
                <td className="py-3 px-4">{formatVnd(tx.depositAmount)}</td>
                <td className="py-3 px-4">{statusLabels[tx.status]}</td>
                <td className="py-3 px-4">
                  {tx.status === 'deposit_received' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedTx(tx)
                        setShowConfirmModal(true)
                      }}
                      disabled={confirmMutation.isPending}
                    >
                      Xác nhận bán thành công
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <Card className="p-8 text-center text-gray-500 mt-4">Chưa có giao dịch</Card>
      )}

      <Modal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Xác nhận bán thành công">
        <p className="text-gray-600 mb-4">
          Bạn có chắc đã bán thành công xe {selectedTx?.car} cho khách hàng {selectedTx?.customer}?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={confirmMutation.isPending}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={() => selectedTx && confirmMutation.mutate(selectedTx.id)}
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
