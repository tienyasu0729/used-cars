import { Card, Button, Badge } from '@/components'
import { adminApi } from '@/api/adminApi'
import { useQuery } from '@tanstack/react-query'
export function RescuePartnersPage() {
  const { data: partners = [] } = useQuery({
    queryKey: ['admin-rescue-partners'],
    queryFn: () => adminApi.getRescuePartners(),
  })

  const statusLabel = (s: string) =>
    s === 'approved' ? 'Đã duyệt' : s === 'pending' ? 'Chờ duyệt' : 'Tạm dừng'

  const statusVariant = (s: string) => (s === 'approved' ? 'success' : s === 'pending' ? 'warning' : 'error')

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Đối tác cứu hộ</h1>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FF6600] text-white">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Garage</th>
              <th className="text-left px-4 py-3 font-medium">Địa điểm</th>
              <th className="text-left px-4 py-3 font-medium">SĐT</th>
              <th className="text-left px-4 py-3 font-medium">Khu vực phủ sóng</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.garageName}</td>
                <td className="px-4 py-3 text-gray-600">{p.location}</td>
                <td className="px-4 py-3 text-gray-600">{p.phone}</td>
                <td className="px-4 py-3 text-gray-600">{p.coverageArea}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(p.status)}>{statusLabel(p.status)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {p.status === 'pending' && (
                      <Button variant="primary" size="sm">
                        Duyệt
                      </Button>
                    )}
                    {p.status === 'approved' && (
                      <Button variant="danger" size="sm">
                        Tạm dừng
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
