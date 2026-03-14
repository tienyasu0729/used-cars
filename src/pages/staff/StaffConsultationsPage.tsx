import { mockConsultations } from '@/mock'

export function StaffConsultationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200">
        <button className="border-b-2 border-[#1A3C6E] px-6 py-4 text-sm font-bold text-[#1A3C6E]">
          Chưa Phản Hồi
        </button>
        <button className="border-b-2 border-transparent px-6 py-4 text-sm font-bold text-slate-500">
          Đang Xử Lý
        </button>
        <button className="border-b-2 border-transparent px-6 py-4 text-sm font-bold text-slate-500">
          Đã Giải Quyết
        </button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {mockConsultations.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between border-b border-slate-100 p-4 last:border-0 hover:bg-slate-50"
          >
            <div>
              <p className="font-bold text-slate-900">{c.customerName}</p>
              <p className="text-sm text-slate-500">{c.message}</p>
              <span
                className={`mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                  c.priority === 'high' ? 'bg-red-100 text-red-700' : c.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {c.priority === 'high' ? 'ƯU TIÊN CAO' : c.priority === 'medium' ? 'TRUNG BÌNH' : 'THẤP'}
              </span>
            </div>
            <button className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-bold text-white">
              Xử Lý Ngay
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
