import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Input } from '@/components'
import { financeApi } from '@/api/financeApi'
import type { FinanceProduct } from '@/api/financeApi'

export function ProductsManagePage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<FinanceProduct | null>(null)

  const { data: products = [] } = useQuery({
    queryKey: ['finance-products'],
    queryFn: () => financeApi.getFinanceProducts(),
  })

  const updateMutation = useMutation({
    mutationFn: (data: FinanceProduct[]) => financeApi.updateFinanceProducts(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-products'] })
      setEditing(null)
    },
  })

  const handleSave = (p: FinanceProduct) => {
    const updated = products.map((x) => (x.id === p.id ? p : x))
    updateMutation.mutate(updated)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Cấu hình Lãi suất / Gói BH</h1>

      <div className="space-y-6">
        {products.map((p) => (
          <Card key={p.id} className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {p.type === 'bank' ? 'Ngân hàng' : 'Bảo hiểm'}
            </h3>
            {editing?.id === p.id ? (
              <div className="grid md:grid-cols-2 gap-4">
                {editing.type === 'bank' && (
                  <>
                    <Input label="Lãi suất (%)" type="number" value={String(editing.interestRate ?? '')} onChange={(e) => setEditing({ ...editing, interestRate: +e.target.value })} />
                    <Input label="Kỳ hạn tối đa (năm)" type="number" value={String(editing.maxLoanTerm ?? '')} onChange={(e) => setEditing({ ...editing, maxLoanTerm: +e.target.value })} />
                    <Input label="LTV tối đa (%)" type="number" value={String(editing.maxLtv ?? '')} onChange={(e) => setEditing({ ...editing, maxLtv: +e.target.value })} />
                  </>
                )}
                {editing.type === 'insurance' && (
                  <>
                    <Input label="Phí BH xe (%)" type="number" value={String(editing.vehicleInsuranceFee ?? '')} onChange={(e) => setEditing({ ...editing, vehicleInsuranceFee: +e.target.value })} />
                    <Input label="Phí BH trách nhiệm (%)" type="number" value={String(editing.liabilityInsuranceFee ?? '')} onChange={(e) => setEditing({ ...editing, liabilityInsuranceFee: +e.target.value })} />
                  </>
                )}
                <div className="md:col-span-2 flex gap-2">
                  <Button variant="primary" onClick={() => editing && handleSave(editing)} disabled={updateMutation.isPending}>Lưu</Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>Hủy</Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  {p.type === 'bank' && (
                    <>
                      <p>Lãi suất: {p.interestRate}%</p>
                      <p>Kỳ hạn: {p.maxLoanTerm} năm</p>
                      <p>LTV max: {p.maxLtv}%</p>
                    </>
                  )}
                  {p.type === 'insurance' && (
                    <>
                      <p>Phí BH xe: {p.vehicleInsuranceFee}%</p>
                      <p>Phí BH TN: {p.liabilityInsuranceFee}%</p>
                    </>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditing(p)}>Chỉnh sửa</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
