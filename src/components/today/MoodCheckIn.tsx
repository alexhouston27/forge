'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'

const MOODS = [
  { emoji: '😤', label: 'Rough',   color: '#ef4444' },
  { emoji: '😕', label: 'Low',     color: '#f97316' },
  { emoji: '😐', label: 'Neutral', color: '#6b7280' },
  { emoji: '🙂', label: 'Good',    color: '#6366f1' },
  { emoji: '😄', label: 'Great',   color: '#10b981' },
] as const

const ENERGIES = [
  { emoji: '🪫', label: 'Empty',    color: '#ef4444' },
  { emoji: '😴', label: 'Low',      color: '#f97316' },
  { emoji: '⚡', label: 'Steady',   color: '#6b7280' },
  { emoji: '🔋', label: 'Energized',color: '#6366f1' },
  { emoji: '🚀', label: 'Fired up', color: '#10b981' },
] as const

export function MoodCheckIn() {
  const { todayMood, todayEnergy, setTodayMood, setTodayEnergy } = useAppStore()

  return (
    <div className="card-base p-5">
      <h2 className="text-sm font-semibold mb-4">Daily Check-in</h2>

      <div className="space-y-5">
        <EmojiRow
          label="How are you feeling?"
          items={MOODS}
          selected={todayMood ?? 0}
          onSelect={setTodayMood}
        />
        <EmojiRow
          label="Energy level?"
          items={ENERGIES}
          selected={todayEnergy ?? 0}
          onSelect={setTodayEnergy}
        />
      </div>

      <AnimatePresence>
        {todayMood != null && todayEnergy != null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-[11px] text-muted-foreground">
                Feeling{' '}
                <span className="font-semibold" style={{ color: MOODS[(todayMood ?? 1) - 1]?.color }}>
                  {MOODS[(todayMood ?? 1) - 1]?.label}
                </span>
                {' '}· Energy{' '}
                <span className="font-semibold" style={{ color: ENERGIES[(todayEnergy ?? 1) - 1]?.color }}>
                  {ENERGIES[(todayEnergy ?? 1) - 1]?.label}
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EmojiRow({
  label,
  items,
  selected,
  onSelect,
}: {
  label: string
  items: readonly { emoji: string; label: string; color: string }[]
  selected: number
  onSelect: (v: number) => void
}) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground font-medium mb-2.5">{label}</p>
      <div className="flex justify-between gap-1">
        {items.map((item, i) => {
          const isSelected = selected === i + 1
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.82 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              onClick={() => onSelect(i + 1)}
              title={item.label}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-150 relative',
                isSelected ? 'outline outline-2' : 'hover:bg-accent',
              )}
              style={isSelected ? {
                backgroundColor: `${item.color}14`,
                outlineColor: item.color,
              } : {}}
            >
              <motion.span
                animate={{ scale: isSelected ? 1.18 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 16 }}
                className="text-xl leading-none"
              >
                {item.emoji}
              </motion.span>
              <AnimatePresence>
                {isSelected && (
                  <motion.span
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[9px] font-semibold leading-none"
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
