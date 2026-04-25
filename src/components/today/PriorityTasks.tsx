'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Clock, CheckCircle2, Circle } from 'lucide-react'
import type { TaskItem } from '@/types'
import { cn, getPriorityColor, minutesToDuration } from '@/lib/utils'
import { useAppStore, useDataStore } from '@/store'
import { Button } from '@/components/ui/button'

interface PriorityTasksProps {
  tasks: TaskItem[]
}

const PRIORITY_ORDER: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
const PRIORITY_LABELS: Record<string, string> = {
  URGENT: 'Urgent', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low',
}

function fireConfetti(x: number, y: number) {
  if (typeof window === 'undefined') return
  import('canvas-confetti').then(({ default: confetti }) => {
    const rect = document.documentElement.getBoundingClientRect()
    confetti({
      particleCount: 28,
      spread: 55,
      origin: {
        x: x / window.innerWidth,
        y: y / window.innerHeight,
      },
      colors: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'],
      scalar: 0.7,
      gravity: 1.2,
      ticks: 120,
    })
  })
}

export function PriorityTasks({ tasks: initialTasks }: PriorityTasksProps) {
  const { showNotification } = useAppStore()
  const { todayTasks: storeTasks, updateTask, addTask } = useDataStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [addingTask, setAddingTask] = useState(false)

  const tasks = storeTasks.length > 0 ? storeTasks : initialTasks
  const sorted = [...tasks].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2),
  )
  const completed = sorted.filter((t) => t.status === 'COMPLETED')
  const pending = sorted.filter((t) => t.status !== 'COMPLETED')

  function toggleTask(task: TaskItem, e: React.MouseEvent) {
    const newStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED'
    updateTask(task.id, {
      status: newStatus,
      completedAt: newStatus === 'COMPLETED' ? new Date() : undefined,
    })
    if (newStatus === 'COMPLETED') {
      fireConfetti(e.clientX, e.clientY)
      showNotification(`✓ ${task.title}`)
    }
  }

  function submitNewTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    addTask({
      id: Math.random().toString(36).slice(2),
      title: newTaskTitle.trim(),
      status: 'TODO',
      priority: 'MEDIUM',
      tags: [],
      scheduledFor: new Date(),
    })
    setNewTaskTitle('')
    setAddingTask(false)
  }

  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Priority Tasks</h2>
          <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full tabular-nums">
            {completed.length}/{tasks.length}
          </span>
        </div>
        <button
          onClick={() => setAddingTask(true)}
          className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add task
        </button>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="h-0.5 rounded-full bg-muted overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full forge-gradient-bg"
            initial={{ width: 0 }}
            animate={{ width: `${Math.round((completed.length / tasks.length) * 100)}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      )}

      <div className="space-y-0.5">
        <AnimatePresence initial={false}>
          {pending.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {addingTask && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={submitNewTask}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2.5 py-2 px-1">
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                <input
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setAddingTask(false)}
                  placeholder="New task..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
                />
                <Button type="submit" size="sm" className="h-6 text-xs px-2.5">Save</Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => setAddingTask(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {completed.length > 0 && (
          <div className="pt-3 mt-1 border-t border-border">
            <p className="text-[11px] text-muted-foreground mb-1.5 px-1">Completed · {completed.length}</p>
            {completed.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} />
            ))}
          </div>
        )}

        {tasks.length === 0 && !addingTask && (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground mb-3">No tasks yet — add something to conquer.</p>
            <button
              onClick={() => setAddingTask(true)}
              className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
            >
              + Add your first task
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function TaskRow({
  task,
  onToggle,
}: {
  task: TaskItem
  onToggle: (t: TaskItem, e: React.MouseEvent) => void
}) {
  const done = task.status === 'COMPLETED'
  const priorityColor = getPriorityColor(task.priority)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, transition: { duration: 0.15 } }}
      className={cn(
        'flex items-start gap-3 py-2 px-2 rounded-xl group cursor-pointer transition-colors duration-100',
        done ? 'opacity-40' : 'hover:bg-accent',
      )}
      onClick={(e) => onToggle(task, e)}
    >
      {/* Animated checkbox */}
      <motion.div
        className="mt-0.5 shrink-0"
        whileTap={{ scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 600, damping: 20 }}
      >
        {done ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          >
            <CheckCircle2 className="w-[18px] h-[18px] text-primary" />
          </motion.div>
        ) : (
          <Circle className="w-[18px] h-[18px] text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
        )}
      </motion.div>

      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm leading-snug',
          done && 'line-through text-muted-foreground',
        )}>
          {task.title}
        </p>
        {(task.estimatedMinutes || (task.tags && task.tags.length > 0)) && (
          <div className="flex items-center gap-2 mt-0.5">
            {task.estimatedMinutes && (
              <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                <Clock className="w-2.5 h-2.5" />
                {minutesToDuration(task.estimatedMinutes)}
              </span>
            )}
            {task.tags?.map((tag) => (
              <span key={tag} className="text-[10px] text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Priority indicator */}
      <div
        className="w-1 h-1 rounded-full mt-2 shrink-0 ring-[2.5px] ring-offset-1 ring-offset-background"
        style={{ backgroundColor: priorityColor }}
        title={PRIORITY_LABELS[task.priority]}
      />
    </motion.div>
  )
}
