import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components'
import { staffApi, type ChangeLog } from '@/api/staffApi'

export function ChangeHistoryPage() {
  const { data: logs = [] } = useQuery({
    queryKey: ['staff-change-history'],
    queryFn: () => staffApi.getChangeHistory(),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Lịch sử thay đổi</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">User</th>
              <th className="text-left py-3 px-4">Hành động</th>
              <th className="text-left py-3 px-4">Module</th>
              <th className="text-left py-3 px-4">Dữ liệu thay đổi</th>
              <th className="text-left py-3 px-4">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: ChangeLog) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{log.user}</td>
                <td className="py-3 px-4">{log.action}</td>
                <td className="py-3 px-4">{log.module}</td>
                <td className="py-3 px-4">{log.changedData}</td>
                <td className="py-3 px-4 text-gray-500">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <Card className="p-8 text-center text-gray-500 mt-4">Không có lịch sử</Card>
      )}
    </div>
  )
}
