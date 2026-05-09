import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getStompBrokerUrl } from '@/utils/stompBrokerUrl'
import { adminAnnouncementsListKey } from '@/services/adminAnnouncements.service'

export function useInboxNotificationsWebSocket() {
  const token = useAuthStore((s) => s.token)
  const role = useAuthStore((s) => s.user?.role)
  const qc = useQueryClient()
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!token) {
      void clientRef.current?.deactivate()
      clientRef.current = null
      return
    }
    const client = new Client({
      brokerURL: getStompBrokerUrl(),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        if (role === 'Admin') {
          client.subscribe('/topic/admin/activity', () => {
            void qc.invalidateQueries({ queryKey: [...adminAnnouncementsListKey] })
          })
        }
        client.subscribe('/user/queue/notifications', () => {
          void qc.invalidateQueries({ queryKey: ['inbox-notifications'] })
        })
      },
    })
    clientRef.current = client
    client.activate()
    return () => {
      void client.deactivate()
      clientRef.current = null
    }
  }, [token, role, qc])
}
