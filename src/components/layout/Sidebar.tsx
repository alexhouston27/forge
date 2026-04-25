'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sun, Target, Flame, Calendar, Lightbulb, BookOpen,
  BarChart2, Zap, Plus, PanelLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const NAV_ITEMS = [
  { title: 'Today',     href: '/today',     icon: Sun,       shortcut: '1' },
  { title: 'Goals',     href: '/goals',     icon: Target,    shortcut: '2' },
  { title: 'Habits',    href: '/habits',    icon: Flame,     shortcut: '3' },
  { title: 'Planner',   href: '/planner',   icon: Calendar,  shortcut: '4' },
  { title: 'Vault',     href: '/vault',     icon: Lightbulb, shortcut: '5' },
  { title: 'Journal',   href: '/journal',   icon: BookOpen,  shortcut: '6' },
  { title: 'Analytics', href: '/analytics', icon: BarChart2, shortcut: '7' },
] as const

export function Sidebar() {
  const pathname  = usePathname()
  const { sidebarCollapsed, toggleSidebar, openQuickCapture } = useAppStore()

  return (
    <TooltipProvider delayDuration={100}>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 60 : 216 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col h-full shrink-0 overflow-hidden"
        style={{
          borderRight: '1px solid hsl(var(--border))',
          background: 'hsl(var(--card))',
        }}
      >
        {/* Logo bar */}
        <div className={cn(
          'flex items-center h-[57px] shrink-0 px-3.5',
          sidebarCollapsed ? 'justify-center' : 'justify-between',
        )}>
          <Link href="/today" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-[9px] forge-gradient-bg flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="text-[15px] font-black tracking-tight"
              >
                FORGE
              </motion.span>
            )}
          </Link>

          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              <PanelLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick capture */}
        <div className={cn('px-3 pb-3', sidebarCollapsed && 'flex justify-center')}>
          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => openQuickCapture()}
                  className="w-8 h-8 rounded-xl forge-gradient-bg flex items-center justify-center text-white shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>Quick capture <kbd className="ml-1 text-[10px] opacity-60">⌘T</kbd></TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => openQuickCapture()}
              className="w-full flex items-center justify-center gap-2 h-8 rounded-xl forge-gradient-bg text-white text-xs font-semibold shadow-sm hover:shadow-md hover:opacity-90 transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              Quick capture
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto no-scrollbar">
          {NAV_ITEMS.map(({ title, href, icon: Icon, shortcut }) => {
            const isActive = pathname === href || (href !== '/today' && pathname.startsWith(`${href}/`))
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      'nav-item',
                      isActive && 'active',
                      sidebarCollapsed && 'justify-center px-0 w-10 h-10 mx-auto',
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: 'hsl(var(--primary) / 0.08)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    <Icon
                      className={cn('w-[18px] h-[18px] shrink-0 relative', isActive ? 'text-primary' : 'text-muted-foreground')}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />

                    {!sidebarCollapsed && (
                      <span className="relative flex-1 text-[13px]">{title}</span>
                    )}

                    {!sidebarCollapsed && (
                      <span className="relative text-[10px] font-mono text-muted-foreground/40">⌘{shortcut}</span>
                    )}
                  </Link>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right" sideOffset={8}>
                    {title} <kbd className="ml-1 text-[10px] opacity-50">⌘{shortcut}</kbd>
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* Footer */}
        {sidebarCollapsed && (
          <div className="px-2 pb-3 pt-2 border-t border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSidebar}
                  className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                  <PanelLeft className="w-[18px] h-[18px] rotate-180" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>Expand sidebar</TooltipContent>
            </Tooltip>
          </div>
        )}
      </motion.aside>
    </TooltipProvider>
  )
}
