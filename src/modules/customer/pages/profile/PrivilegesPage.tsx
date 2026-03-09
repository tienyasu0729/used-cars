import { Card } from '@/components'
import { customerApi } from '@/api/customerApi'
import { useQuery } from '@tanstack/react-query'

export function PrivilegesPage() {
  const { data: vouchers = [] } = useQuery({
    queryKey: ['vouchers'],
    queryFn: () => customerApi.getVouchers(),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Ưu đãi</h1>
      <div className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">Quyền lợi thành viên</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Cứu hộ 1 năm miễn phí</li>
          <li>Voucher thay dầu</li>
        </ul>
      </div>
      <h2 className="font-semibold text-gray-900 mb-4">Voucher của tôi</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {vouchers.map((v) => (
          <Card key={v.id} className="p-4">
            <p className="font-semibold text-gray-900">{v.name}</p>
            <p className="text-sm text-gray-600 mt-1">{v.description}</p>
            <p className="text-xs text-gray-500 mt-2">HSD: {v.expiryDate}</p>
            <span
              className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${
                v.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
              }`}
            >
              {v.status === 'active' ? 'Còn hiệu lực' : v.status}
            </span>
          </Card>
        ))}
      </div>
    </div>
  )
}
