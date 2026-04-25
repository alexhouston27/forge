'use client'

import { Search, Focus, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const DEMO_XP = 2840
const DEMO_LEVEL = 12
const DEMO_XP_TO_NEXT = 3200
const DEMO_STREAK = 14

export function Header() {
  const { setCommandPaletteOpen, focusModeActive, toggleFocusMode, profile } = useAppStore()
  const { signOut } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.replace('/login')
  }

  const xpPct = Math.round((DEMO_XP / DEMO_XP_TO_NEXT) * 100)

  return (
    <header className="flex items-center justify-between h-[57px] px-4 shrink-0 sticky top-0 z-40"
      style={{
        borderBottom: '1px solid hsl(var(--border))',
        background: 'hsl(var(--background) / 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Left: XP + streak */}
      <div className="flex items-center gap-3">
        {/* Level badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/15">
          <Zap className="w-3 h-3 text-primary" strokeWidth={2.5} />
          <span className="text-xs font-bold text-primary">Lv.{DEMO_LEVEL}</span>
        </div>

        {/* XP bar */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full forge-gradient-bg"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums">{DEMO_XP.toLocaleString()} XP</span>
        </div>

        {/* Streak */}
        <div className="hidden md:flex items-center gap-1 text-orange-500">
          <span className="text-sm">🔥</span>
          <span className="text-xs font-semibold">{DEMO_STREAK}</span>
        </div>
      </div>

      {/* Center: search */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-muted/40 text-sm text-muted-foreground hover:bg-muted hover:border-border/80 transition-all duration-150 group"
      >
        <Search className="w-3.5 h-3.5 group-hover:text-foreground transition-colors" />
        <span className="text-[13px]">Search or command</span>
        <kbd className="ml-2 text-[10px] font-mono bg-background border border-border rounded-md px-1.5 py-0.5 text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleFocusMode}
          title="Toggle focus mode"
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150',
            focusModeActive
              ? 'text-primary bg-primary/10 border border-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          )}
        >
          <Focus className="w-4 h-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none ml-1">
              <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/25 transition-all duration-150">
                <AvatarFallback
                  className="text-white text-[11px] font-black"
                  style={{ backgroundColor: profile.avatarColor }}
                >
                  {profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal pb-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold leading-none">{profile.name}</p>
                <p className="text-xs leading-none text-muted-foreground">Level {DEMO_LEVEL} · {DEMO_XP.toLocaleString()} XP</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>Profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
