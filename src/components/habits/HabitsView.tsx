'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Plus } from 'lucide-react'
import { HabitCard } from './HabitCard'
import { HeatMap } from './HeatMap'
import { Button } from '@/components/ui/button'
import { PageWrapper } from '@/components/shared/PageWrapper'
import { useDataStore } from '@/store'
import { useAuth } from '@/context/AuthContext'
import { toggleHabitDate, addHabit } from '@/lib/firestore-data'

function fireHabitConfetti(x: number, y: number) {
  if (typeof window === 'undefined') return
  import('canvas-confetti').then(({ default: confetti }) => {
    confetti({
      particleCount: 22,
      spread: 55,
      origin: { x: x / window.innerWidth, y: y / window.innerHeight },
      colors: ['#f97316', '#ef4444', '#fbbf24'],
      scalar: 0.65,
      gravity: 1.3,
      ticks: 100,
    })
  })
}

export function HabitsView() {
  const { user } = useAuth()
  const { habits, toggleHabit: toggleLocal } = useDataStore()
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const totalCompleted = habits.filter((h) => h.todayLog?.completed).length
  const longestStreak = Math.max(...habits.map((h) => h.longestStreak), 0)
  const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0)

  async function handleToggle(habitId: string, e: React.MouseEvent) {
    if (!user) return
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return
    const newCompleted = !habit.todayLog?.completed
    if (newCompleted) fireHabitConfetti(e.clientX, e.clientY)
    toggleLocal(habitId, newCompleted)
    await toggleHabitDate(user.uid, habitId, newCompleted)
  }

  async function handleAddHabit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !newTitle.trim()) return
    await addHabit(user.uid, {
      title: newTitle.trim(),
      category: 'OTHER',
      color: '#6366f1',
      frequency: 'DAILY',
    })
    setNewTitle('')
    setAdding(false)
  }

  const heatmapLogs = habits.flatMap((h) =>
    (h.completedDates ?? []).map((date) => ({ date, completed: true }))
  )

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-5 py-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[26px] font-black tracking-tight flex items-center gap-2.5">
              <span>🔥</span> Habits
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Build the daily rituals that compound over time.
            </p>
          </div>
          <Button
            className="gap-2 forge-gradient-bg text-white border-0 shadow-sm hover:opacity-90"
            onClick={() => setAdding(true)}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New Habit
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard icon="🔥" label="Today" value={`${totalCompleted}/${habits.length}`} sub="completed" color="text-orange-500" />
          <StatCard icon="🏆" label="Best Streak" value={`${longestStreak}d`} sub="longest run" color="text-yellow-500" />
          <StatCard icon="📈" label="All time" value={totalCompletions.toString()} sub="check-ins" color="text-primary" />
        </div>

        {adding && (
          <form onSubmit={handleAddHabit} className="mb-4 flex gap-2">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Habit name (e.g. Morning workout)"
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button type="submit" size="sm" className="forge-gradient-bg text-white border-0">Add</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Today's habits
            </p>
            {habits.length === 0 ? (
              <div className="card-base p-8 text-center text-muted-foreground">
                <Flame className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No habits yet</p>
                <p className="text-xs mt-1">Click "New Habit" to add your first one</p>
              </div>
            ) : (
              <motion.div
                className="space-y-2"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.045 } } }}
              >
                {habits.map((habit) => (
                  <motion.div
                    key={habit.id}
                    variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } } }}
                  >
                    <HabitCard habit={habit} onToggle={handleToggle} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Consistency
            </p>
            <div className="card-base p-4">
              <HeatMap logs={heatmapLogs} />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card-base p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
      <p className={`text-2xl font-black mt-0.5 tabular-nums ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  )
}
