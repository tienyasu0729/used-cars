const input = 'w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm'

type Props = {
  vnpayPayUrl: string
  setVnpayPayUrl: (v: string) => void
  vnpayMerchantApiUrl: string
  setVnpayMerchantApiUrl: (v: string) => void
  vnpayReturnUrl: string
  setVnpayReturnUrl: (v: string) => void
  vnpayIpnUrl: string
  setVnpayIpnUrl: (v: string) => void
  appFeBase: string
  setAppFeBase: (v: string) => void
}

export function ConfigVnpayUrlFields({
  vnpayPayUrl,
  setVnpayPayUrl,
  vnpayMerchantApiUrl,
  setVnpayMerchantApiUrl,
  vnpayReturnUrl,
  setVnpayReturnUrl,
  vnpayIpnUrl,
  setVnpayIpnUrl,
  appFeBase,
  setAppFeBase,
}: Props) {
  return (
    <div className="space-y-4 border-t border-slate-200 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">URL sandbox / ngrok (VNPay)</p>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Pay URL</label>
        <input type="text" value={vnpayPayUrl} onChange={(e) => setVnpayPayUrl(e.target.value)} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Merchant WebAPI (querydr / refund)</label>
        <input
          type="text"
          value={vnpayMerchantApiUrl}
          onChange={(e) => setVnpayMerchantApiUrl(e.target.value)}
          placeholder="https://sandbox.vnpayment.vn/merchant_webapi/api/transaction"
          className={input}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Return URL (backend, công khai)</label>
        <input
          type="text"
          value={vnpayReturnUrl}
          onChange={(e) => setVnpayReturnUrl(e.target.value)}
          placeholder="https://YOUR-NGROK/api/v1/payment/vnpay/return"
          className={input}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">IPN URL (backend, công khai)</label>
        <input
          type="text"
          value={vnpayIpnUrl}
          onChange={(e) => setVnpayIpnUrl(e.target.value)}
          placeholder="https://YOUR-NGROK/api/v1/payment/vnpay/ipn"
          className={input}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Frontend base (redirect sau thanh toán)</label>
        <input
          type="text"
          value={appFeBase}
          onChange={(e) => setAppFeBase(e.target.value)}
          placeholder="http://localhost:5173"
          className={input}
        />
      </div>
    </div>
  )
}
