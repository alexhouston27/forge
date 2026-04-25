'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { QuickCapture } from '@/components/shared/QuickCapture'
import { Toaster } from '@/components/ui/toaster'
import { useAppStore } from '@/store'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useAuth } from '@/context/AuthContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { focusModeActive, commandPaletteOpen, setCommandPaletteOpen } = useAppStore()
  const { user, loading } = useAuth()
  const router = useRouter()
  useKeyboard()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading FORGE…</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {!focusModeActive && <Sidebar />}

      <div className="flex flex-col flex-1 overflow-hidden">
        {!focusModeActive && <Header />}

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
      <QuickCapture />
      <Toaster />
    </div>
  )
}
