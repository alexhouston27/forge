'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'
import type { HabitWithLog } from '@/types'
import { cn, getStreakLabel } from '@/lib/utils'
import { useDataStore, useAppStore } from '@/store'
import { useAuth } from '@/context/AuthContext'
import { toggleHabitDate } from '@/lib/firestore-data'

interface HabitsDueProps {
  habits: HabitWithLog[]
}

function fireHabitConfetti(x: number, y: number) {
  if (typeof window === 'undefined') return
  import('canvas-confetti').then(({ default: confetti }) => {
    confetti({
      particleCount: 20,
      spread: 60,
      origin: { x: x / window.innerWidth, y: y / window.innerHeight },
      colors: ['#f97316', '#ef4444', '#fbbf24', '#fb923c'],
      scalar: 0.65,
      gravity: 1.4,
      ticks: 100,
    })
  })
}

export function HabitsDue({ habits: demoHabits }: HabitsDueProps) {
  const { habits: storeHabits, toggleHabit } = useDataStore()
  const { showNotification } = useAppStore()
  const { user } = useAuth()

  const habits = storeHabits.length > 0 ? storeHabits : demoHabits
  const completed = habits.filter((h) => h.todayLog?.completed).length

  async function handleToggle(habit: HabitWithLog, e: React.MouseEvent) {
    const newCompleted = !habit.todayLog?.completed
    toggleHabit(habit.id, newCompleted)
    if (newCompleted) {
      fireHabitConfetti(e.clientX, e.clientY)
      showNotification(`🔥 ${habit.title} — ${habit.currentStreak + 1} day streak!`)
    }
    if (user) await toggleHabitDate(user.uid, habit.id, newCompleted)
  }

  const allDone = completed === habits.length && habits.length > 0

  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-7 h-7 rounded-[10px] flex items-center justify-center transition-all duration-300',
            allDone
              ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-sm'
              : 'bg-orange-500/10',
          )}>
            <Flame
              className={cn('w-3.5 h-3.5 transition-colors', allDone ? 'text-white' : 'text-orange-500')}
              strokeWidth={2.5}
            />
          </div>
          <h2 className="text-sm font-semibold">Habits</h2>
          <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full tabular-nums">
            {completed}/{habits.length} today
          </span>
        </div>

        {/* Dot progress */}
        <div className="flex gap-1">
          {habits.map((h) => (
            <motion.div
              key={h.id}
              animate={{
                backgroundColor: h.todayLog?.completed ? '#f97316' : 'hsl(var(--muted))',
                scale: h.todayLog?.completed ? [1, 1.3, 1] : 1,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-1.5 h-4 rounded-full"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {habits.map((habit, i) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25, ease: 'easeOut' }}
          >
            <HabitChip habit={habit} onToggle={handleToggle} />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
              <span className="text-sm">🏆</span>
              <p className="text-xs font-medium text-orange-500">
                Perfect day! All habits complete.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function HabitChip({
  habit,
  onToggle,
}: {
  habit: HabitWithLog
  onToggle: (h: HabitWithLog, e: React.MouseEvent) => void
}) {
  const done = habit.todayLog?.completed ?? false

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      onClick={(e) => onToggle(habit, e)}
      className={cn(
        'habit-chip w-full text-left relative overflow-hidden',
        done ? 'habit-chip-done' : 'habit-chip-idle',
      )}
    >
      {/* Shine effect on done */}
      {done && (
        <motion.div
          initial={{ x: '-100%', opacity: 0.6 }}
          animate={{ x: '200%', opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />
      )}

      <span className="text-lg shrink-0 relative">{habit.emoji ?? '⚡'}</span>
      <div className="min-w-0 flex-1 relative">
        <p className="text-xs font-semibold truncate leading-tight">{habit.title}</p>
        <p className={cn('text-[10px] mt-0.5 leading-none', done ? 'text-white/80' : 'text-muted-foreground')}>
          {done
            ? `${habit.currentStreak + 1}🔥 streak`
            : getStreakLabel(habit.currentStreak)}
        </p>
      </div>
    </motion.button>
  )
}
