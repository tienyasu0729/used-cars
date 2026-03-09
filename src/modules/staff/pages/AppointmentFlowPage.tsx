import { useQuery } from '@tanstack/react-query'
import { Card, Button, Badge } from '@/components'
import { staffApi, type AppointmentFlowItem } from '@/api/staffApi'
import { Eye, Phone, Flag } from 'lucide-react'

export function AppointmentFlowPage() {
  const { data: items = [] } = useQuery({
    queryKey: ['staff-appointment-flow'],
    queryFn: () => staffApi.getAppointmentFlow(),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Đối soát luồng Hẹn - Bán</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">Appointment ID</th>
              <th className="text-left py-3 px-4">Xe</th>
              <th className="text-left py-3 px-4">Khách hàng</th>
              <th className="text-left py-3 px-4">Showroom</th>
              <th className="text-left py-3 px-4">Ngày hẹn</th>
              <th className="text-left py-3 px-4">Trạng thái bán</th>
              <th className="text-left py-3 px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row: AppointmentFlowItem) => (
              <tr
                key={row.id}
                className={`border-b border-gray-100 hover:bg-gray-50 ${row.suspicious ? 'bg-red-50' : ''}`}
              >
                <td className="py-3 px-4 font-medium">{row.appointmentId}</td>
                <td className="py-3 px-4">{row.car}</td>
                <td className="py-3 px-4">{row.customer}</td>
                <td className="py-3 px-4">{row.showroom}</td>
                <td className="py-3 px-4">{row.appointmentDate}</td>
                <td className="py-3 px-4">
                  <Badge variant={row.saleStatus === 'reported' ? 'success' : 'warning'}>
                    {row.saleStatus === 'reported' ? 'Đã báo' : 'Chưa báo'}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    {row.suspicious && (
                      <Button variant="danger" size="sm">
                        <Flag className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <Card className="p-8 text-center text-gray-500 mt-4">Không có dữ liệu</Card>
      )}
    </div>
  )
}
