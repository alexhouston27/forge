'use client'

import { useState } from 'react'
import { Target, Pencil, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'

export function DailyFocus() {
  const { dailyFocus, setDailyFocus } = useAppStore()
  const [editing, setEditing] = useState(!dailyFocus)
  const [draft, setDraft] = useState(dailyFocus)

  function save() {
    if (draft.trim()) {
      setDailyFocus(draft.trim())
    }
    setEditing(false)
  }

  function startEdit() {
    setDraft(dailyFocus)
    setEditing(true)
  }

  return (
    <div className="card-glow p-5 group">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-[10px] forge-gradient-bg flex items-center justify-center shadow-sm">
          <Target className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Main Focus
        </span>
        <AnimatePresence>
          {!editing && dailyFocus && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0, scale: 1 }}
              whileHover={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={startEdit}
              className="ml-auto text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
            >
              <Pencil className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save()
                if (e.key === 'Escape') setEditing(false)
              }}
              placeholder="What's the one thing that makes today a win?"
              className="flex-1 bg-transparent text-[15px] font-semibold leading-snug outline-none placeholder:text-muted-foreground/40"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={save}
              className="w-7 h-7 rounded-lg forge-gradient-bg flex items-center justify-center text-white shrink-0 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.p
            key="display"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'text-[15px] font-semibold leading-snug cursor-pointer',
              !dailyFocus && 'text-muted-foreground/50 italic',
            )}
            onClick={startEdit}
          >
            {dailyFocus || 'Set your main focus for today...'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
