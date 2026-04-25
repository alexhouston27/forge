'use client'

import { useMemo } from 'react'
import { eachDayOfInterval, subDays, format, isSameDay } from 'date-fns'
import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface HeatMapProps {
  logs: { date: string; completed: boolean }[]
  color?: string
}

export function HeatMap({ logs, color = '#f97316' }: HeatMapProps) {
  const today = new Date()
  const days = useMemo(
    () => eachDayOfInterval({ start: subDays(today, 90), end: today }),
    [],
  )

  const completedDates = useMemo(
    () => new Set(logs.filter((l) => l.completed).map((l) => l.date.split('T')[0])),
    [logs],
  )

  const weeks: Date[][] = []
  let week: Date[] = []
  days.forEach((day) => {
    week.push(day)
    if (day.getDay() === 6) {
      weeks.push(week)
      week = []
    }
  })
  if (week.length) weeks.push(week)

  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const dayLabels = ['', 'M', '', 'W', '', 'F', '']

  const totalDone = completedDates.size
  const streak = useMemo(() => {
    let s = 0
    const d = new Date(today)
    while (completedDates.has(format(d, 'yyyy-MM-dd'))) {
      s++
      d.setDate(d.getDate() - 1)
    }
    return s
  }, [completedDates, today])

  return (
    <TooltipProvider delayDuration={0}>
      <div>
        {/* Stats row */}
        <div className="flex items-center gap-4 mb-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Last 90 days</p>
          </div>
          <div className="ml-auto flex items-center gap-3 text-[11px]">
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{totalDone}</span> completed
            </span>
            {streak > 0 && (
              <span className="text-orange-500 font-semibold">
                {streak}🔥 streak
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] shrink-0 mr-0.5 pt-[14px]">
            {dayLabels.map((d, i) => (
              <div key={i} className="h-[11px] flex items-center text-[9px] text-muted-foreground/60 w-3">
                {d}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((weekDays, wi) => {
            const firstDay = weekDays[0]
            const showMonth = firstDay && firstDay.getDate() <= 7

            return (
              <div key={wi} className="flex flex-col gap-[3px]">
                <div className="h-[10px] text-[9px] text-muted-foreground/60 leading-none whitespace-nowrap">
                  {showMonth ? monthLabels[firstDay.getMonth()] : ''}
                </div>
                {weekDays.map((day, di) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const done = completedDates.has(dateStr)
                  const isToday = isSameDay(day, today)
                  const cellIndex = wi * 7 + di

                  return (
                    <Tooltip key={di}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: cellIndex * 0.003,
                            duration: 0.25,
                            ease: 'easeOut',
                          }}
                          className="w-[11px] h-[11px] rounded-[2px] cursor-pointer transition-transform hover:scale-125"
                          style={{
                            backgroundColor: done ? color : 'hsl(var(--muted))',
                            opacity: done ? 1 : isToday ? 1 : 0.55,
                            outline: isToday ? `2px solid ${done ? color : 'hsl(var(--primary))'}` : 'none',
                            outlineOffset: '1px',
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-[11px] py-1 px-2">
                        <span className="font-medium">{format(day, 'MMM d')}</span>
                        {' · '}
                        {done ? (
                          <span className="text-orange-500">Completed ✓</span>
                        ) : (
                          <span className="text-muted-foreground">Not completed</span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="text-[9px] text-muted-foreground/60">Less</span>
          {[0.15, 0.3, 0.5, 0.75, 1].map((op) => (
            <div
              key={op}
              className="w-[10px] h-[10px] rounded-[2px]"
              style={{ backgroundColor: color, opacity: op }}
            />
          ))}
          <span className="text-[9px] text-muted-foreground/60">More</span>
        </div>
      </div>
    </TooltipProvider>
  )
}
