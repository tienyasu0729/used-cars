import { useState, useRef, useEffect } from 'react'
import { Button, Input, Avatar } from '@/components'
import { customerApi } from '@/api/customerApi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function ProfileInfoPage() {
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const { data: profile } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => customerApi.getProfile(),
  })
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setPhone(profile.phone)
      setAvatarPreview(profile.avatarUrl ?? null)
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: () => customerApi.updateProfile({ name, phone }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer-profile'] }),
  })

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarPreview(URL.createObjectURL(file))
      const res = await customerApi.uploadAvatar(file)
      if (res.avatarUrl) setAvatarPreview(res.avatarUrl)
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] })
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Thông tin cá nhân</h1>
      <div className="max-w-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
          <div className="flex items-center gap-4">
            <Avatar name={name} size="lg" src={avatarPreview ?? undefined} />
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                Chọn ảnh
              </Button>
            </div>
          </div>
        </div>
        <Input label="Họ tên" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button variant="primary" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
          Cập nhật
        </Button>
      </div>
    </div>
  )
}
