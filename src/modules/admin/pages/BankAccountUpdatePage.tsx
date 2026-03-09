import { useState } from 'react'
import { Button, Card, Input } from '@/components'

export function BankAccountUpdatePage() {
  const [form, setForm] = useState({
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    accountName: 'CarHub Motors',
    branch: 'Chi nhánh Đà Nẵng',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Update Bank Account</h1>

      <Card className="p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Bank Name"
            value={form.bankName}
            onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
          />
          <Input
            label="Account Number"
            value={form.accountNumber}
            onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
          />
          <Input
            label="Account Name"
            value={form.accountName}
            onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
          />
          <Input
            label="Branch"
            value={form.branch}
            onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
          />
          <div className="flex gap-2 pt-4">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
