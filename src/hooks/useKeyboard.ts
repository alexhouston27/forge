import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store'

const NAV_SHORTCUTS: Record<string, string> = {
  '1': '/today',
  '2': '/goals',
  '3': '/habits',
  '4': '/planner',
  '5': '/vault',
  '6': '/journal',
  '7': '/analytics',
}

export function useKeyboard() {
  const router = useRouter()
  const { setCommandPaletteOpen, openQuickCapture, toggleFocusMode, toggleSidebar } = useAppStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) ||
        (e.target as HTMLElement).isContentEditable

      // Global shortcuts (work everywhere)
      if ((e.metaKey || e.ctrlKey)) {
        switch (e.key) {
          case 'k':
            e.preventDefault()
            setCommandPaletteOpen(true)
            return
          case 't':
            e.preventDefault()
            openQuickCapture('task')
            return
          case 'i':
            e.preventDefault()
            openQuickCapture('idea')
            return
          case 'f':
            e.preventDefault()
            toggleFocusMode()
            return
          case '\\':
            e.preventDefault()
            toggleSidebar()
            return
        }
      }

      // Navigation shortcuts (only when not in input)
      if (!isInput && (e.metaKey || e.ctrlKey) && NAV_SHORTCUTS[e.key]) {
        e.preventDefault()
        router.push(NAV_SHORTCUTS[e.key])
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router, setCommandPaletteOpen, openQuickCapture, toggleFocusMode, toggleSidebar])
}
