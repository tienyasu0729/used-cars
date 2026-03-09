import { Card, Badge } from '@/components'
import { formatVnd } from '@/utils/formatters'

const mockHistory = [
  { id: '1', date: '26 Oct 2024', type: 'Deposit', amount: 500_000_000, status: 'Completed' },
  { id: '2', date: '25 Oct 2024', type: 'Commission', amount: -15_000_000, status: 'Completed' },
  { id: '3', date: '24 Oct 2024', type: 'Withdrawal', amount: -200_000_000, status: 'Pending' },
]

export function BalanceHistoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Bank Account History</h1>

      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className="text-2xl font-bold text-gray-900">{formatVnd(2_850_000_000)}</p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockHistory.map((row) => (
              <tr key={row.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-600">{row.date}</td>
                <td className="px-4 py-3 font-medium">{row.type}</td>
                <td
                  className={`px-4 py-3 font-medium ${row.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {row.amount >= 0 ? '+' : ''}{formatVnd(Math.abs(row.amount))}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={row.status === 'Completed' ? 'success' : 'warning'}>
                    {row.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
