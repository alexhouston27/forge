'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { QuickCapture } from '@/components/shared/QuickCapture'
import { Toaster } from '@/components/ui/toaster'
import { useAppStore } from '@/store'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useAuth } from '@/context/AuthContext'
import { FirestoreProvider } from '@/providers/FirestoreProvider'

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
    <FirestoreProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar — desktop only */}
        {!focusModeActive && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}

        <div className="flex flex-col flex-1 overflow-hidden">
          {!focusModeActive && <Header />}

          {/* Main content — extra bottom padding on mobile for the bottom nav */}
          <main className="flex-1 overflow-y-auto pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
            {children}
          </main>
        </div>

        {/* Bottom nav — mobile only */}
        {!focusModeActive && <BottomNav />}

        <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
        <QuickCapture />
        <Toaster />
      </div>
    </FirestoreProvider>
  )
}
