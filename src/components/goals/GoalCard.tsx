'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, CheckCircle2, Circle, Calendar, ChevronDown } from 'lucide-react'
import type { GoalWithRelations } from '@/types'
import { cn, formatShortDate, daysUntil, CATEGORY_EMOJIS, getCategoryColor } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface GoalCardProps {
  goal: GoalWithRelations
  onUpdate: (goal: GoalWithRelations) => void
}

export function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false)
  const completedMilestones = goal.milestones.filter((m) => m.status === 'COMPLETED').length
  const daysLeft = goal.targetDate ? daysUntil(goal.targetDate) : null
  const pct = Math.round(goal.progress)

  function toggleMilestone(milestoneId: string) {
    onUpdate({
      ...goal,
      milestones: goal.milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, status: m.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }
          : m,
      ),
    })
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="card-base p-5 group relative overflow-hidden cursor-default"
    >
      {/* Top color bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${goal.color}, ${goal.color}80)` }}
      />

      {/* Header */}
      <div className="flex items-start gap-3 pt-0.5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: `${goal.color}18` }}
        >
          {goal.emoji ?? CATEGORY_EMOJIS[goal.category] ?? '⭐'}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-snug truncate">{goal.title}</h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
              style={{ backgroundColor: `${goal.color}18`, color: goal.color }}
            >
              {goal.category}
            </span>
            {daysLeft !== null && (
              <span className={cn(
                'text-[10px] flex items-center gap-0.5',
                daysLeft < 7 && daysLeft > 0 ? 'text-orange-500' :
                daysLeft <= 0 ? 'text-destructive' : 'text-muted-foreground',
              )}>
                <Calendar className="w-2.5 h-2.5" />
                {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent shrink-0">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit goal</DropdownMenuItem>
            <DropdownMenuItem>Mark complete</DropdownMenuItem>
            <DropdownMenuItem>Add milestone</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {goal.description && (
        <p className="text-[12px] text-muted-foreground mt-2 leading-relaxed line-clamp-2">
          {goal.description}
        </p>
      )}

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-muted-foreground">Progress</span>
          <motion.span
            className="text-[11px] font-bold tabular-nums"
            style={{ color: goal.color }}
          >
            {pct}%
          </motion.span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: goal.color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          />
        </div>
      </div>

      {/* Milestones toggle */}
      {goal.milestones.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-3 h-3" />
            </motion.div>
            {completedMilestones}/{goal.milestones.length} milestones
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-0.5">
                  {goal.milestones.map((milestone) => (
                    <motion.button
                      key={milestone.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleMilestone(milestone.id)}
                      className="w-full flex items-center gap-2 text-left py-1.5 px-1 rounded-lg hover:bg-accent group/ms transition-colors"
                    >
                      {milestone.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-muted-foreground/30 group-hover/ms:text-muted-foreground/60 shrink-0 transition-colors" />
                      )}
                      <span className={cn(
                        'text-xs',
                        milestone.status === 'COMPLETED' && 'line-through text-muted-foreground',
                      )}>
                        {milestone.title}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border flex items-center gap-3 text-[10px] text-muted-foreground">
        {goal.habits.length > 0 && (
          <span>🔥 {goal.habits.length} habit{goal.habits.length !== 1 ? 's' : ''}</span>
        )}
        {goal.tasks.length > 0 && (
          <span>✓ {goal.tasks.filter((t) => t.status === 'COMPLETED').length}/{goal.tasks.length} tasks</span>
        )}
        <span className="ml-auto font-medium capitalize" style={{ color: goal.color }}>
          {goal.status.toLowerCase()}
        </span>
      </div>
    </motion.div>
  )
}
