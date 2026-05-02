import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

if (typeof document !== 'undefined') {
  const applyDateInputLocale = () => {
    document.querySelectorAll<HTMLInputElement>('input[type="date"]').forEach((el) => {
      el.lang = 'en-GB'
    })
  }
  applyDateInputLocale()
  const observer = new MutationObserver(() => applyDateInputLocale())
  observer.observe(document.documentElement, { childList: true, subtree: true })
}

createRoot(document.getElementById('root')!).render(
  <App />,
)
