import { useState } from 'react'
import { Card, Button } from '@/components'
import { Paperclip, Send } from 'lucide-react'
import { chatApi } from '@/api/chatApi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function ChatPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>('1')
  const [message, setMessage] = useState('')

  const { data: conversations = [] } = useQuery({
    queryKey: ['chat-showroom-conversations'],
    queryFn: () => chatApi.getConversations('showroom'),
  })

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-showroom-messages', selectedId],
    queryFn: () => (selectedId ? chatApi.getMessages('showroom', selectedId) : []),
    enabled: !!selectedId,
  })

  const sendMutation = useMutation({
    mutationFn: (text: string) => (selectedId ? chatApi.sendMessage('showroom', selectedId, text) : Promise.reject()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-showroom-messages', selectedId] })
      queryClient.invalidateQueries({ queryKey: ['chat-showroom-conversations'] })
    },
  })

  const handleSend = () => {
    if (message.trim() && selectedId) {
      sendMutation.mutate(message.trim())
      setMessage('')
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-11rem)]">
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6 shrink-0">Chat với khách hàng</h1>

      <div className="flex gap-6 flex-1 min-h-0">
        <Card className="w-72 shrink-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Cuộc hội thoại</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left p-4 hover:bg-gray-50 flex flex-col ${selectedId === c.id ? 'bg-[#FFEEE0]' : ''}`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{c.name}</span>
                  {c.unread > 0 && <span className="w-2 h-2 bg-[#FF6600] rounded-full" />}
                </div>
                <span className="text-sm text-gray-500 truncate">{c.lastMsg}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">{conversations.find((c) => c.id === selectedId)?.name ?? 'Chat'}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'showroom' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg px-4 py-2 ${m.from === 'showroom' ? 'bg-[#FF6600] text-white' : 'bg-gray-100 text-gray-900'}`}>
                  <p>{m.text}</p>
                  <p className="text-xs opacity-75 mt-1">{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="w-5 h-5" />
            </Button>
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <Button variant="primary" size="sm" onClick={handleSend} disabled={sendMutation.isPending}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
