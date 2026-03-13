import { useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { Button } from '@/components/ui'

export function FloatingChatWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8612A] text-white shadow-lg hover:bg-orange-600"
        title="Tư Vấn Ngay"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#1A3C6E]" />
              <div>
                <p className="text-sm font-medium">Tư Vấn Viên SCUDN</p>
                <p className="text-xs text-green-600">Đang trực tuyến</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 hover:bg-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="h-[380px] overflow-y-auto p-4">
            <div className="rounded-r-2xl rounded-tl-2xl bg-gray-100 p-3 text-sm">
              Xin chào! Tôi có thể giúp gì cho bạn hôm nay?
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Xem xe đang có', 'Lịch làm việc', 'Chính sách đặt cọc'].map((text) => (
                <button
                  key={text}
                  className="rounded-full border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 border-t border-gray-200 p-3">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
            />
            <Button variant="accent" size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
