'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sun, Target, Flame, Calendar, BookOpen, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { title: 'Today',     href: '/today',     icon: Sun },
  { title: 'Habits',    href: '/habits',    icon: Flame },
  { title: 'Goals',     href: '/goals',     icon: Target },
  { title: 'Planner',   href: '/planner',   icon: Calendar },
  { title: 'Journal',   href: '/journal',   icon: BookOpen },
  { title: 'Analytics', href: '/analytics', icon: BarChart2 },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background: 'hsl(var(--card) / 0.96)',
        borderTop: '1px solid hsl(var(--border))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV_ITEMS.map(({ title, href, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/today' && pathname.startsWith(`${href}/`))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon
              className="w-5 h-5"
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            <span className={cn('text-[10px] font-medium', isActive ? 'text-primary' : 'text-muted-foreground/70')}>
              {title}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
