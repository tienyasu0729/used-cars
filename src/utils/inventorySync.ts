export const INVENTORY_CHANGED_EVENT = 'used-cars:inventory-changed'

export function notifyInventoryChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(INVENTORY_CHANGED_EVENT))
}
