import { Card } from '@/components'
import { useAuthStore } from '@/stores/authStore'

export function InspectorProfilePage() {
  const { user } = useAuthStore()

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-[#FF6600] mb-4">Cá nhân</h1>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
            {user?.name?.charAt(0) ?? 'I'}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{user?.name ?? 'Inspector'}</h2>
            <p className="text-sm text-gray-500">{user?.email ?? ''}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
