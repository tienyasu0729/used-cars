const input = 'w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm'

type Props = {
  zaloEndpoint: string
  setZaloEndpoint: (v: string) => void
  zaloCallback: string
  setZaloCallback: (v: string) => void
}

export function ConfigZaloUrlFields({
  zaloEndpoint,
  setZaloEndpoint,
  zaloCallback,
  setZaloCallback,
}: Props) {
  return (
    <div className="space-y-4 border-t border-slate-200 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">URL sandbox / ngrok (ZaloPay)</p>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Create order endpoint</label>
        <input type="text" value={zaloEndpoint} onChange={(e) => setZaloEndpoint(e.target.value)} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Callback URL (backend, công khai)</label>
        <input
          type="text"
          value={zaloCallback}
          onChange={(e) => setZaloCallback(e.target.value)}
          placeholder="https://YOUR-NGROK/api/v1/payment/zalopay/callback"
          className={input}
        />
      </div>
    </div>
  )
}
