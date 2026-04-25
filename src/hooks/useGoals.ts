import { useState, useCallback } from 'react'
import type { GoalWithRelations } from '@/types'

interface UseGoalsReturn {
  goals: GoalWithRelations[]
  loading: boolean
  error: string | null
  fetchGoals: () => Promise<void>
  createGoal: (data: Partial<GoalWithRelations>) => Promise<GoalWithRelations | null>
  updateGoal: (id: string, data: Partial<GoalWithRelations>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  updateProgress: (id: string, progress: number) => Promise<void>
}

export function useGoals(initialGoals: GoalWithRelations[] = []): UseGoalsReturn {
  const [goals, setGoals] = useState<GoalWithRelations[]>(initialGoals)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/goals')
      if (!res.ok) throw new Error('Failed to fetch goals')
      const data = await res.json() as GoalWithRelations[]
      setGoals(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const createGoal = useCallback(async (data: Partial<GoalWithRelations>) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create goal')
      const newGoal = await res.json() as GoalWithRelations
      setGoals((prev) => [newGoal, ...prev])
      return newGoal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }, [])

  const updateGoal = useCallback(async (id: string, data: Partial<GoalWithRelations>) => {
    // Optimistic update
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)))
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update goal')
    } catch (err) {
      // Rollback on error
      await fetchGoals()
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [fetchGoals])

  const deleteGoal = useCallback(async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete goal')
    } catch (err) {
      await fetchGoals()
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [fetchGoals])

  const updateProgress = useCallback(async (id: string, progress: number) => {
    await updateGoal(id, { progress })
  }, [updateGoal])

  return { goals, loading, error, fetchGoals, createGoal, updateGoal, deleteGoal, updateProgress }
}
