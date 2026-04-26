const PREFIX = 'chat-participant-name:'

export function rememberChatParticipantName(conversationId: string | number, name: string): void {
  const n = name.trim()
  if (!n) return
  sessionStorage.setItem(PREFIX + String(conversationId), n)
}

export function getChatParticipantName(conversationId: string | undefined): string | undefined {
  if (!conversationId) return undefined
  const v = sessionStorage.getItem(PREFIX + conversationId)
  return v?.trim() || undefined
}
