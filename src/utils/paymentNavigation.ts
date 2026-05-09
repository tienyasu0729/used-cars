let overlayNode: HTMLDivElement | null = null
let pageshowBound = false

function clearOverlay() {
  if (overlayNode?.parentNode) {
    overlayNode.parentNode.removeChild(overlayNode)
  }
  overlayNode = null
}

if (typeof window !== 'undefined' && !pageshowBound) {
  pageshowBound = true
  window.addEventListener('pageshow', () => {
    clearOverlay()
  })
}

export function navigateToPaymentUrl(url: string): void {
  const u = url.trim()
  if (!u) return

  clearOverlay()
  const el = document.createElement('div')
  overlayNode = el
  el.setAttribute('role', 'status')
  el.setAttribute('aria-live', 'polite')
  el.style.cssText =
    'position:fixed;inset:0;z-index:2147483647;background:#f8fafc;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;padding:24px;box-sizing:border-box'

  const spin = document.createElement('div')
  spin.style.cssText =
    'width:44px;height:44px;border:3px solid #e2e8f0;border-top-color:#1A3C6E;border-radius:50%;animation:paynav-spin 0.75s linear infinite'

  const style = document.createElement('style')
  style.textContent = '@keyframes paynav-spin{to{transform:rotate(360deg)}}'

  const p = document.createElement('p')
  p.style.cssText =
    'margin:0;color:#1e293b;font:600 15px/1.4 system-ui,sans-serif;text-align:center;max-width:320px'
  p.textContent = 'Đang chuyển đến cổng thanh toán…'

  const sub = document.createElement('p')
  sub.style.cssText =
    'margin:0;color:#64748b;font:13px/1.4 system-ui,sans-serif;text-align:center;max-width:340px'
  sub.textContent = 'Trang tiếp theo có thể tải vài giây. Vui lòng không đóng trình duyệt.'

  el.appendChild(style)
  el.appendChild(spin)
  el.appendChild(p)
  el.appendChild(sub)
  document.body.appendChild(el)

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.location.assign(u)
    })
  })
}
