import { useState } from 'react'
import { Card, Badge } from '@/components'
import { adminApi } from '@/api/adminApi'
import { useQuery } from '@tanstack/react-query'

export function SystemLogsPage() {
  const [userFilter, setUserFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const { data: logs = [] } = useQuery({
    queryKey: ['admin-system-logs'],
    queryFn: () => adminApi.getSystemLogs(),
  })

  const filtered = logs.filter((log) => {
    if (userFilter && !log.user.toLowerCase().includes(userFilter.toLowerCase())) return false
    if (roleFilter && log.role !== roleFilter) return false
    return true
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Nhật ký hệ thống</h1>

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Người dùng</label>
            <input
              type="text"
              placeholder="Tìm user..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Vai trò</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Tất cả</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FF6600] text-white">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Thời gian</th>
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">Vai trò</th>
              <th className="text-left px-4 py-3 font-medium">Hành động</th>
              <th className="text-left px-4 py-3 font-medium">Module</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{log.timestamp}</td>
                <td className="px-4 py-3 font-medium">{log.user}</td>
                <td className="px-4 py-3 text-gray-600">{log.role}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3 text-gray-600">{log.targetModule}</td>
                <td className="px-4 py-3">
                  <Badge variant={log.status === 'success' ? 'success' : 'error'}>
                    {log.status === 'success' ? 'Thành công' : 'Thất bại'}
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
