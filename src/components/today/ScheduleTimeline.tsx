'use client'

import { cn, formatTime } from '@/lib/utils'
import type { TimeBlockItem } from '@/types'

interface ScheduleTimelineProps {
  timeBlocks: TimeBlockItem[]
}

const CATEGORY_COLORS: Record<string, string> = {
  WORK: '#6366f1',
  HEALTH: '#10b981',
  LEARNING: '#8b5cf6',
  BREAK: '#f59e0b',
  PERSONAL: '#ec4899',
  OTHER: '#94a3b8',
}

export function ScheduleTimeline({ timeBlocks }: ScheduleTimelineProps) {
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const sorted = [...timeBlocks].sort((a, b) => a.startTime.localeCompare(b.startTime))
  const activeIndex = sorted.findIndex(
    (b) => b.startTime <= currentTime && b.endTime > currentTime,
  )

  return (
    <div className="forge-card">
      <h2 className="font-semibold text-sm mb-4">Today's Schedule</h2>

      {timeBlocks.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-muted-foreground">No schedule yet.</p>
          <p className="text-xs text-muted-foreground mt-0.5">Use AI Planner to generate one.</p>
        </div>
      ) : (
        <div className="relative space-y-1">
          {/* Current time line */}
          <div className="absolute left-[52px] right-0 top-0 bottom-0 pointer-events-none">
            {activeIndex >= 0 && (
              <div
                className="absolute w-full flex items-center gap-1"
                style={{ top: `${activeIndex * 52 + 26}px` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary -ml-0.5" />
                <div className="h-px flex-1 bg-primary/50" />
              </div>
            )}
          </div>

          {sorted.map((block, i) => {
            const color = block.color || CATEGORY_COLORS[block.category ?? ''] || '#94a3b8'
            const isActive = i === activeIndex
            const isPast = block.endTime < currentTime

            return (
              <div
                key={block.id}
                className={cn(
                  'flex items-center gap-3 py-1.5 px-2 rounded-lg transition-all',
                  isActive && 'bg-primary/5',
                  isPast && 'opacity-50',
                )}
              >
                {/* Time */}
                <div className="w-10 shrink-0 text-right">
                  <span className="text-[10px] font-mono text-muted-foreground leading-none">
                    {formatTime(block.startTime)}
                  </span>
                </div>

                {/* Color bar */}
                <div
                  className="w-0.5 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />

                {/* Block info */}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-medium truncate', isActive && 'text-primary')}>
                    {block.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatTime(block.startTime)} – {formatTime(block.endTime)}
                  </p>
                </div>

                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-subtle shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
