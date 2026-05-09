import { useEffect } from 'react'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `SCUDN - ${title}` : 'SCUDN'
    return () => {
      document.title = 'SCUDN - Chợ xe ô tô Đà Nẵng'
    }
  }, [title])
}
