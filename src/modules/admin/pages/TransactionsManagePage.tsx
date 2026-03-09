import { useState } from 'react'
import { Card, Badge } from '@/components'
import { adminApi } from '@/api/adminApi'
import { useQuery } from '@tanstack/react-query'
import { formatVnd } from '@/utils/formatters'
const statusVariant: Record<string, 'success' | 'warning' | 'error'> = {
  Completed: 'success',
  Escrow: 'warning',
  Pending: 'warning',
  Refunded: 'error',
}

export function TransactionsManagePage() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showroomFilter, setShowroomFilter] = useState('')

  const { data: transactions = [] } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: () => adminApi.getTransactions(),
  })

  const filtered = transactions.filter((tx) => {
    if (statusFilter && tx.status !== statusFilter) return false
    if (showroomFilter && !tx.showroom.toLowerCase().includes(showroomFilter.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Quản lý giao dịch Escrow</h1>

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Tất cả</option>
              <option value="Pending">Pending</option>
              <option value="Escrow">Escrow</option>
              <option value="Completed">Completed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Showroom</label>
            <input
              type="text"
              placeholder="Tìm showroom..."
              value={showroomFilter}
              onChange={(e) => setShowroomFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FF6600] text-white">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Mã GD</th>
              <th className="text-left px-4 py-3 font-medium">Khách hàng</th>
              <th className="text-left px-4 py-3 font-medium">Showroom</th>
              <th className="text-left px-4 py-3 font-medium">Tiền cọc</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium">Ngày</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{tx.id}</td>
                <td className="px-4 py-3 text-gray-600">{tx.customer}</td>
                <td className="px-4 py-3 text-gray-600">{tx.showroom}</td>
                <td className="px-4 py-3">{formatVnd(tx.depositAmount)}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[tx.status] || 'warning'}>{tx.status}</Badge>
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
