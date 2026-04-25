import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import type { HabitWithLog } from '@/types'

export function useHabits(initialHabits: HabitWithLog[] = []) {
  const [habits, setHabits] = useState<HabitWithLog[]>(initialHabits)
  const [loading, setLoading] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')

  const toggleHabit = useCallback(async (habitId: string, value?: number) => {
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return

    const newCompleted = !habit.todayLog?.completed

    // Optimistic update
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h
        return {
          ...h,
          todayLog: { completed: newCompleted, value: value ?? h.todayLog?.value },
          currentStreak: newCompleted ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1),
          totalCompletions: newCompleted ? h.totalCompletions + 1 : h.totalCompletions - 1,
        }
      }),
    )

    try {
      await fetch(`/api/habits/${habitId}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, completed: newCompleted, value }),
      })
    } catch {
      // Rollback
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId ? { ...h, todayLog: habit.todayLog } : h,
        ),
      )
    }
  }, [habits, today])

  const addHabit = useCallback(async (data: Partial<HabitWithLog>) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create habit')
      const newHabit = await res.json() as HabitWithLog
      setHabits((prev) => [...prev, newHabit])
    } catch (err) {
      console.error(err)
    }
  }, [])

  const completionRate = habits.length
    ? Math.round((habits.filter((h) => h.todayLog?.completed).length / habits.length) * 100)
    : 0

  return { habits, loading, toggleHabit, addHabit, completionRate }
}
