import { Card } from '@/components'
import { customerApi } from '@/api/customerApi'
import { useQuery } from '@tanstack/react-query'
import { formatVnd } from '@/utils/formatters'

export function TransactionsPage() {
  const { data: transactions = [] } = useQuery({
    queryKey: ['customer-transactions'],
    queryFn: () => customerApi.getTransactions(),
  })

  const statusLabel = (s: string) => (s === 'completed' ? 'Hoàn thành' : s === 'pending' ? 'Chờ xử lý' : 'Hoàn tiền')
  const statusVariant = (s: string) => (s === 'completed' ? 'success' : s === 'pending' ? 'warning' : 'error')

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Lịch sử giao dịch</h1>
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FF6600] text-white">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Mã GD</th>
              <th className="text-left px-4 py-3 font-medium">Xe</th>
              <th className="text-left px-4 py-3 font-medium">Số tiền</th>
              <th className="text-left px-4 py-3 font-medium">Loại</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium">Ngày</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{tx.id}</td>
                <td className="px-4 py-3 text-gray-600">{tx.carName}</td>
                <td className="px-4 py-3">{formatVnd(tx.amount)}</td>
                <td className="px-4 py-3 text-gray-600">
                  {tx.type === 'deposit' ? 'Đặt cọc' : tx.type === 'payment' ? 'Thanh toán' : 'Hoàn tiền'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs ${
                      statusVariant(tx.status) === 'success'
                        ? 'bg-green-100 text-green-800'
                        : statusVariant(tx.status) === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {statusLabel(tx.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
