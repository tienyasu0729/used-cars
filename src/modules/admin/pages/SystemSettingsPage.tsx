import { useState, useRef, useEffect } from 'react'
import { Card, Button, Input } from '@/components'
import { adminApi } from '@/api/adminApi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function SystemSettingsPage() {
  const queryClient = useQueryClient()
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [hotline, setHotline] = useState('1900 xxxx')
  const [supportEmail, setSupportEmail] = useState('support@scudn.vn')
  const [facebook, setFacebook] = useState('')
  const [zalo, setZalo] = useState('')
  const [website, setWebsite] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: settings } = useQuery({
    queryKey: ['admin-system-settings'],
    queryFn: () => adminApi.getSystemSettings(),
  })

  useEffect(() => {
    if (settings) {
      setHotline(settings.hotline ?? '1900 xxxx')
      setSupportEmail(settings.supportEmail ?? 'support@scudn.vn')
      setFacebook(settings.facebook ?? '')
      setZalo(settings.zalo ?? '')
      setWebsite(settings.website ?? '')
      if (settings.logoUrl) setLogoPreview(settings.logoUrl)
    }
  }, [settings])

  const updateMutation = useMutation({
    mutationFn: () =>
      adminApi.updateSystemSettings({ hotline, supportEmail, facebook: facebook || undefined, zalo: zalo || undefined, website: website || undefined }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-system-settings'] }),
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setLogoPreview(URL.createObjectURL(file))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Cài đặt hệ thống</h1>

      <div className="space-y-6 max-w-2xl">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Cài đặt chung</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo nền tảng</label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Chọn ảnh
                  </Button>
                </div>
              </div>
            </div>
            <Input
              label="Hotline"
              value={hotline}
              onChange={(e) => setHotline(e.target.value)}
              placeholder="1900 xxxx"
            />
            <Input
              label="Email hỗ trợ"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@scudn.vn"
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Liên kết mạng xã hội</h2>
          <div className="space-y-4">
            <Input
              label="Facebook"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/..."
            />
            <Input
              label="Zalo"
              value={zalo}
              onChange={(e) => setZalo(e.target.value)}
              placeholder="https://zalo.me/..."
            />
            <Input
              label="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://scudn.vn"
            />
          </div>
        </Card>

        <Button variant="primary" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
          Lưu cài đặt
        </Button>
      </div>
    </div>
  )
}
