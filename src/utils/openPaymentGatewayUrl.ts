export function openPaymentGatewayUrl(url: string): boolean {
  const w = window.open(url, '_blank', 'noopener,noreferrer')
  return w != null
}
