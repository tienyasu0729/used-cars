import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAdminConfig, usePutAdminConfig, configListToMap } from '@/hooks/useAdminConfig'
import { useToastStore } from '@/store/toastStore'
import { ConfigVnpayUrlFields } from './ConfigVnpayUrlFields'
import { ConfigZaloUrlFields } from './ConfigZaloUrlFields'

const K = {
  vnpayTmn: 'vnpay_tmn_code',
  vnpaySecret: 'vnpay_hash_secret',
  vnpayOn: 'vnpay_enabled',
  vnpayPayUrl: 'vnpay_pay_url',
  vnpayMerchantApiUrl: 'vnpay_merchant_api_url',
  vnpayReturnUrl: 'vnpay_return_url',
  vnpayIpnUrl: 'vnpay_ipn_url',
  zaloApp: 'zalopay_app_id',
  zaloKey1: 'zalopay_key1',
  zaloKey2: 'zalopay_key2',
  zaloOn: 'zalopay_enabled',
  zaloEndpoint: 'zalopay_endpoint',
  zaloCallback: 'zalopay_callback_url',
  appFeBase: 'app_frontend_base_url',
  minDep: 'payment_min_deposit',
  resHrs: 'payment_reservation_hours',
} as const

function readBool(v: string | undefined) {
  return String(v).toLowerCase() === 'true'
}

export function ConfigPaymentTab() {
  const toast = useToastStore()
  const { data, isLoading } = useAdminConfig()
  const putCfg = usePutAdminConfig()
  const [showVnpaySecret, setShowVnpaySecret] = useState(false)
  const [showZaloKey2, setShowZaloKey2] = useState(false)
  const [vnpayTmn, setVnpayTmn] = useState('')
  const [vnpaySecret, setVnpaySecret] = useState('')
  const [vnpayEnabled, setVnpayEnabled] = useState(false)
  const [zaloAppId, setZaloAppId] = useState('')
  const [zaloKey1, setZaloKey1] = useState('')
  const [zaloKey2, setZaloKey2] = useState('')
  const [zaloEnabled, setZaloEnabled] = useState(false)
  const [vnpayPayUrl, setVnpayPayUrl] = useState('')
  const [vnpayMerchantApiUrl, setVnpayMerchantApiUrl] = useState('')
  const [vnpayReturnUrl, setVnpayReturnUrl] = useState('')
  const [vnpayIpnUrl, setVnpayIpnUrl] = useState('')
  const [zaloEndpoint, setZaloEndpoint] = useState('')
  const [zaloCallback, setZaloCallback] = useState('')
  const [appFeBase, setAppFeBase] = useState('')
  const [minDeposit, setMinDeposit] = useState('10000000')
  const [reservationHours, setReservationHours] = useState('48')

  useEffect(() => {
    if (!data) return
    const m = configListToMap(data)
    setVnpayTmn(m[K.vnpayTmn] ?? '')
    setVnpaySecret(m[K.vnpaySecret] ?? '')
    setVnpayEnabled(readBool(m[K.vnpayOn]))
    setZaloAppId(m[K.zaloApp] ?? '')
    setZaloKey1(m[K.zaloKey1] ?? '')
    setZaloKey2(m[K.zaloKey2] ?? '')
    setZaloEnabled(readBool(m[K.zaloOn]))
    setVnpayPayUrl(m[K.vnpayPayUrl] ?? '')
    setVnpayMerchantApiUrl(m[K.vnpayMerchantApiUrl] ?? '')
    setVnpayReturnUrl(m[K.vnpayReturnUrl] ?? '')
    setVnpayIpnUrl(m[K.vnpayIpnUrl] ?? '')
    setZaloEndpoint(m[K.zaloEndpoint] ?? '')
    setZaloCallback(m[K.zaloCallback] ?? '')
    setAppFeBase(m[K.appFeBase] ?? '')
    setMinDeposit(m[K.minDep] || '10000000')
    setReservationHours(m[K.resHrs] || '48')
  }, [data])

  const save = async () => {
    try {
      await putCfg.mutateAsync([
        { key: K.vnpayTmn, value: vnpayTmn },
        { key: K.vnpaySecret, value: vnpaySecret },
        { key: K.vnpayOn, value: vnpayEnabled ? 'true' : 'false' },
        { key: K.zaloApp, value: zaloAppId },
        { key: K.zaloKey1, value: zaloKey1 },
        { key: K.zaloKey2, value: zaloKey2 },
        { key: K.zaloOn, value: zaloEnabled ? 'true' : 'false' },
        { key: K.vnpayPayUrl, value: vnpayPayUrl },
        { key: K.vnpayMerchantApiUrl, value: vnpayMerchantApiUrl },
        { key: K.vnpayReturnUrl, value: vnpayReturnUrl },
        { key: K.vnpayIpnUrl, value: vnpayIpnUrl },
        { key: K.zaloEndpoint, value: zaloEndpoint },
        { key: K.zaloCallback, value: zaloCallback },
        { key: K.appFeBase, value: appFeBase },
        { key: K.minDep, value: minDeposit },
        { key: K.resHrs, value: reservationHours },
      ])
      toast.addToast('success', 'Đã lưu cấu hình thanh toán.')
    } catch {
      toast.addToast('error', 'Không lưu được.')
    }
  }

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500">Đang tải cấu hình...</div>
  }

  return (
    <div className="space-y-8">
      <div className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-slate-900">Cổng thanh toán</h3>
        <p className="mb-6 text-sm text-slate-500">VNPay và ZaloPay — lưu vào SystemConfigs</p>
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
            <span className="text-sm font-semibold text-slate-700">VNPay</span>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Tên mã (TMN)</label>
                <input
                  type="text"
                  value={vnpayTmn}
                  onChange={(e) => setVnpayTmn(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Hash secret</label>
                <div className="relative">
                  <input
                    type={showVnpaySecret ? 'text' : 'password'}
                    value={vnpaySecret}
                    onChange={(e) => setVnpaySecret(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVnpaySecret(!showVnpaySecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showVnpaySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={vnpayEnabled}
                  onChange={(e) => setVnpayEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#1A3C6E]"
                />
                <span className="text-sm text-slate-600">Bật VNPay</span>
              </label>
              <ConfigVnpayUrlFields
                vnpayPayUrl={vnpayPayUrl}
                setVnpayPayUrl={setVnpayPayUrl}
                vnpayMerchantApiUrl={vnpayMerchantApiUrl}
                setVnpayMerchantApiUrl={setVnpayMerchantApiUrl}
                vnpayReturnUrl={vnpayReturnUrl}
                setVnpayReturnUrl={setVnpayReturnUrl}
                vnpayIpnUrl={vnpayIpnUrl}
                setVnpayIpnUrl={setVnpayIpnUrl}
                appFeBase={appFeBase}
                setAppFeBase={setAppFeBase}
              />
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
            <span className="text-sm font-semibold text-slate-700">ZaloPay</span>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">App ID</label>
                <input
                  type="text"
                  value={zaloAppId}
                  onChange={(e) => setZaloAppId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Key 1</label>
                <input
                  type="text"
                  value={zaloKey1}
                  onChange={(e) => setZaloKey1(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Key 2</label>
                <div className="relative">
                  <input
                    type={showZaloKey2 ? 'text' : 'password'}
                    value={zaloKey2}
                    onChange={(e) => setZaloKey2(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowZaloKey2(!showZaloKey2)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showZaloKey2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={zaloEnabled}
                  onChange={(e) => setZaloEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#1A3C6E]"
                />
                <span className="text-sm text-slate-600">Bật ZaloPay</span>
              </label>
              <ConfigZaloUrlFields
                zaloEndpoint={zaloEndpoint}
                setZaloEndpoint={setZaloEndpoint}
                zaloCallback={zaloCallback}
                setZaloCallback={setZaloCallback}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-slate-900">Đặt cọc</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Tiền cọc tối thiểu (VNĐ)</label>
            <input
              type="text"
              inputMode="numeric"
              value={minDeposit}
              onChange={(e) => setMinDeposit(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Giữ chỗ (giờ)</label>
            <input
              type="text"
              inputMode="numeric"
              value={reservationHours}
              onChange={(e) => setReservationHours(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="primary" onClick={save} loading={putCfg.isPending}>Lưu cấu hình</Button>
      </div>
    </div>
  )
}
