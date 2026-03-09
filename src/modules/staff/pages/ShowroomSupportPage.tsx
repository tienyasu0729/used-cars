import { useQuery } from '@tanstack/react-query'
import { Card, Button, Badge } from '@/components'
import { staffApi } from '@/api/staffApi'
import { Eye, Check, Send } from 'lucide-react'

export function ShowroomSupportPage() {
  const { data: applications = [] } = useQuery({
    queryKey: ['staff-showroom-applications'],
    queryFn: () => staffApi.getShowroomApplications(),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Hỗ trợ đăng ký Showroom</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">Tên showroom</th>
              <th className="text-left py-3 px-4">Chủ sở hữu</th>
              <th className="text-left py-3 px-4">SĐT</th>
              <th className="text-left py-3 px-4">Địa điểm</th>
              <th className="text-left py-3 px-4">Trạng thái</th>
              <th className="text-left py-3 px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{app.showroomName}</td>
                <td className="py-3 px-4">{app.owner}</td>
                <td className="py-3 px-4">{app.phone}</td>
                <td className="py-3 px-4">{app.location}</td>
                <td className="py-3 px-4">
                  <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'error' : 'warning'}>
                    {app.status === 'pending' ? 'Chờ duyệt' : app.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {app.status === 'pending' && (
                      <>
                        <Button variant="primary" size="sm">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {applications.length === 0 && (
        <Card className="p-8 text-center text-gray-500 mt-4">Không có đơn đăng ký</Card>
      )}
    </div>
  )
}
