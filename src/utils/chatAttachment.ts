export const VEHICLE_ATTACHMENT_MESSAGE_TYPE = 'vehicle_attachment'

export interface VehicleAttachmentPayload {
  vehicleId: number
  title: string
  priceText?: string
  imageUrl?: string
}

export interface VehicleAttachmentMessagePayload {
  text?: string
  attachment: VehicleAttachmentPayload
}

export function buildVehicleAttachmentMessagePayload(
  attachment: VehicleAttachmentPayload,
  text?: string,
): string {
  return JSON.stringify({
    text: text?.trim() || '',
    attachment: {
      vehicleId: attachment.vehicleId,
      title: attachment.title,
      priceText: attachment.priceText,
      imageUrl: attachment.imageUrl,
    },
  } satisfies VehicleAttachmentMessagePayload)
}

export function parseVehicleAttachmentMessagePayload(content: string): VehicleAttachmentMessagePayload | null {
  try {
    const raw = JSON.parse(content) as Partial<VehicleAttachmentMessagePayload>
    const attachment = raw?.attachment
    if (!attachment || typeof attachment !== 'object') return null
    const vehicleId = Number((attachment as { vehicleId?: unknown }).vehicleId)
    const title = (attachment as { title?: unknown }).title
    if (!Number.isFinite(vehicleId) || typeof title !== 'string' || !title.trim()) return null
    const priceText = (attachment as { priceText?: unknown }).priceText
    const imageUrl = (attachment as { imageUrl?: unknown }).imageUrl
    const text = typeof raw.text === 'string' ? raw.text : ''
    return {
      text,
      attachment: {
        vehicleId,
        title: title.trim(),
        priceText: typeof priceText === 'string' ? priceText : undefined,
        imageUrl: typeof imageUrl === 'string' ? imageUrl : undefined,
      },
    }
  } catch {
    return null
  }
}

export function getConversationLastMessagePreview(content: string, messageType?: string): string {
  if (messageType && messageType !== VEHICLE_ATTACHMENT_MESSAGE_TYPE) return content
  const parsed = parseVehicleAttachmentMessagePayload(content)
  if (!parsed) return content
  const title = parsed.attachment.title
  if (!parsed.text || !parsed.text.trim()) return `Xe đính kèm: ${title}`
  return `Xe đính kèm: ${title} • ${parsed.text.trim()}`
}
