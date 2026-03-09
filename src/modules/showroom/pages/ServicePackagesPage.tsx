import { useQuery } from '@tanstack/react-query'
import { Card, Button } from '@/components'
import { showroomApi } from '@/api/showroomApi'
import { formatVnd } from '@/utils/formatters'

export function ServicePackagesPage() {
  const { data: packages = [] } = useQuery({
    queryKey: ['showroom-packages'],
    queryFn: () => showroomApi.getServicePackages(),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Mua gói dịch vụ</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="p-6">
            <h3 className="font-semibold text-gray-900 text-lg">{pkg.name}</h3>
            <p className="text-[#FF6600] font-bold text-xl mt-2">{formatVnd(pkg.price)}</p>
            <p className="text-sm text-gray-600 mt-2">{pkg.description}</p>
            <Button variant="primary" className="w-full mt-4">
              Mua gói
            </Button>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <Card className="p-8 text-center text-gray-500">Chưa có gói dịch vụ</Card>
      )}
    </div>
  )
}
