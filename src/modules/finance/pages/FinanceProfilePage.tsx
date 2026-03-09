import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Input } from '@/components'
import { financeApi } from '@/api/financeApi'
import { FileText, Eye } from 'lucide-react'

export function FinanceProfilePage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ companyName: '', phone: '', supportEmail: '' })

  const { data: profile } = useQuery({
    queryKey: ['finance-profile'],
    queryFn: () => financeApi.getFinanceProfile(),
  })

  useEffect(() => {
    if (profile) {
      setForm({
        companyName: profile.companyName,
        phone: profile.phone,
        supportEmail: profile.supportEmail,
      })
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: () => financeApi.updateFinanceProfile(profile!.id, form),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance-profile'] }),
  })

  if (!profile) return null

  const docs = [
    { label: 'Giấy phép kinh doanh', key: 'businessLicense', value: profile.businessLicense },
    { label: 'Giấy phép kinh doanh BH', key: 'insuranceLicense', value: profile.insuranceLicense },
    { label: 'Chứng nhận ngân hàng', key: 'bankCertification', value: profile.bankCertification },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Hồ sơ pháp lý</h1>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Logo & Thông tin</h2>
        <div className="flex gap-6 mb-6">
          <div className="w-32 h-32 rounded bg-gray-200 flex items-center justify-center text-gray-500 text-sm shrink-0">
            Logo
          </div>
          <div>
            <Button variant="outline" size="sm" type="button">Upload Logo</Button>
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate() }} className="grid md:grid-cols-2 gap-4">
          <Input label="Tên công ty" value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} />
          <Input label="Số điện thoại" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="Email hỗ trợ" type="email" value={form.supportEmail} onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))} />
          <div className="md:col-span-2">
            <Button type="submit" variant="primary" disabled={updateMutation.isPending}>Lưu thay đổi</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Tài liệu pháp lý</h2>
        <div className="space-y-4">
          {docs.map((d) => (
            <div key={d.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <span>{d.label}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Upload</Button>
                {d.value && (
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
