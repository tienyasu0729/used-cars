import axios from 'axios'

const aiChatAxios = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000,
})

// ── Types ────────────────────────────────────────────────────────

export interface AIChatHealthResponse {
  status: string
  embedding_ready: boolean
}

export interface AIChatSessionResponse {
  session_id: number
}

export interface AIChatSendMessageResponse {
  reply: string
  intent: 'RAG' | 'SQL' | 'OTHER'
  session_id: number
  vehicle_ids: number[]
}

export interface AIChatMessageRecord {
  id: number
  session_id: number
  sender_type: 'user' | 'ai'
  content: string
  sent_at: string
}

// ── API Functions ────────────────────────────────────────────────

export async function checkAIChatHealth(): Promise<AIChatHealthResponse> {
  const { data } = await aiChatAxios.get<AIChatHealthResponse>('/ai-health')
  return data
}

export async function createAIChatSession(
  userId?: number | null,
  guestId?: string | null,
): Promise<AIChatSessionResponse> {
  const body: Record<string, unknown> = {}
  if (userId) body.user_id = userId
  if (guestId) body.guest_id = guestId

  const { data } = await aiChatAxios.post<AIChatSessionResponse>(
    '/ai-chat/sessions',
    body,
  )
  return data
}

export async function sendAIChatMessage(
  sessionId: number,
  message: string,
): Promise<AIChatSendMessageResponse> {
  const { data } = await aiChatAxios.post<AIChatSendMessageResponse>(
    `/ai-chat/sessions/${sessionId}/messages`,
    { message },
  )
  return data
}

export async function getAIChatMessages(
  sessionId: number,
): Promise<AIChatMessageRecord[]> {
  const { data } = await aiChatAxios.get<AIChatMessageRecord[]>(
    `/ai-chat/sessions/${sessionId}/messages`,
  )
  return data
}

export async function deleteAIChatSession(
  sessionId: number,
): Promise<void> {
  await aiChatAxios.delete(`/ai-chat/sessions/${sessionId}`)
}
