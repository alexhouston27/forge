'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Target } from 'lucide-react'
import { GoalCard } from './GoalCard'
import { GoalForm } from './GoalForm'
import { Button } from '@/components/ui/button'
import type { GoalWithRelations } from '@/types'
import { PageWrapper } from '@/components/shared/PageWrapper'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useDataStore } from '@/store'
import { useAuth } from '@/context/AuthContext'
import { addGoal, updateGoal } from '@/lib/firestore-data'

const CATEGORIES = ['All', 'HEALTH', 'CAREER', 'LEARNING', 'FINANCE', 'PERSONAL', 'BUSINESS']
const CATEGORY_LABELS: Record<string, string> = {
  All: 'All',
  HEALTH: '💪 Health',
  CAREER: '💼 Career',
  LEARNING: '📚 Learning',
  FINANCE: '💰 Finance',
  PERSONAL: '⭐ Personal',
  BUSINESS: '🚀 Business',
}

export function GoalsView() {
  const { user } = useAuth()
  const { goals, updateGoal: updateLocal } = useDataStore()
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)

  const filtered = filter === 'All' ? goals : goals.filter((g) => g.category === filter)
  const activeGoals = goals.filter((g) => g.status === 'ACTIVE').length
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED').length
  const avgProgress = goals.length
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0

  async function handleCreate(data: Partial<GoalWithRelations>) {
    if (!user) return
    await addGoal(user.uid, data)
    setShowForm(false)
  }

  async function handleUpdate(updated: GoalWithRelations) {
    if (!user) return
    updateLocal(updated.id, updated)
    await updateGoal(user.uid, updated.id, updated)
  }

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Goals
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeGoals} active · {completedGoals} completed · {avgProgress}% avg progress
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Goal
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No goals yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first goal and start forging your future.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create a goal
            </Button>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {filtered.map((goal) => (
              <motion.div
                key={goal.id}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              >
                <GoalCard goal={goal} onUpdate={handleUpdate} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create a new goal</DialogTitle>
            </DialogHeader>
            <GoalForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  )
}
