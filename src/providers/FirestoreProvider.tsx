'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useDataStore } from '@/store'
import {
  subscribeToHabits,
  subscribeToTasks,
  subscribeToGoals,
  subscribeToNotes,
} from '@/lib/firestore-data'

export function FirestoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { setHabits, setTasks, setGoals, setNotes } = useDataStore()

  useEffect(() => {
    if (!user) {
      setHabits([])
      setTasks([])
      setGoals([])
      setNotes([])
      return
    }

    const uid = user.uid
    const unsubHabits = subscribeToHabits(uid, setHabits)
    const unsubTasks = subscribeToTasks(uid, (tasks) => {
      const today = new Date().toISOString().split('T')[0]
      setTasks(tasks)
      useDataStore.getState().setTodayTasks(
        tasks.filter((t) => !t.scheduledFor || t.scheduledFor === today)
      )
    })
    const unsubGoals = subscribeToGoals(uid, setGoals)
    const unsubNotes = subscribeToNotes(uid, setNotes)

    return () => {
      unsubHabits()
      unsubTasks()
      unsubGoals()
      unsubNotes()
    }
  }, [user, setHabits, setTasks, setGoals, setNotes])

  return <>{children}</>
}
