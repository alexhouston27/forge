'use client'

import { motion } from 'framer-motion'
import { Flame, MoreHorizontal } from 'lucide-react'
import type { HabitWithLog } from '@/types'
import { cn, getStreakLabel } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HabitCardProps {
  habit: HabitWithLog
  onToggle: (id: string, e: React.MouseEvent) => void
}

export function HabitCard({ habit, onToggle }: HabitCardProps) {
  const done = habit.todayLog?.completed ?? false
  const streakOnFire = habit.currentStreak >= 7

  return (
    <motion.div
      layout
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'card-interactive p-4 flex items-center gap-3 cursor-pointer select-none group',
        done && 'border-orange-500/25',
      )}
      onClick={(e) => onToggle(habit.id, e)}
    >
      {/* Animated check button */}
      <motion.div
        whileTap={{ scale: 0.82 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        className={cn(
          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
          done
            ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md'
            : 'bg-muted border-2 border-muted-foreground/15 group-hover:border-orange-400/40',
        )}
        style={done ? { boxShadow: '0 4px 12px -2px rgb(249 115 22 / 0.4)' } : {}}
      >
        <motion.span
          initial={false}
          animate={{ scale: done ? 1 : 0, opacity: done ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          className="text-sm"
        >
          ✓
        </motion.span>
      </motion.div>

      {/* Emoji */}
      <motion.span
        animate={{ scale: done ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
        className="text-xl shrink-0"
      >
        {habit.emoji ?? '⚡'}
      </motion.span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium transition-all', done && 'line-through text-muted-foreground')}>
          {habit.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground capitalize">{habit.category.toLowerCase()}</span>
          {habit.currentStreak > 0 && (
            <span className={cn(
              'flex items-center gap-0.5 text-[11px] font-medium',
              streakOnFire ? 'text-orange-500' : 'text-muted-foreground',
            )}>
              <Flame className="w-2.5 h-2.5" />
              {getStreakLabel(habit.currentStreak)}
            </span>
          )}
        </div>
      </div>

      {/* Streak badge */}
      {habit.currentStreak >= 3 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0',
            streakOnFire
              ? 'bg-orange-500/12 text-orange-500'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {habit.currentStreak}🔥
        </motion.div>
      )}

      {/* Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-lg hover:bg-muted shrink-0">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem>Edit habit</DropdownMenuItem>
          <DropdownMenuItem>View history</DropdownMenuItem>
          <DropdownMenuItem>Link to goal</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}
