'use client'

import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { DailyFocus } from './DailyFocus'
import { PriorityTasks } from './PriorityTasks'
import { HabitsDue } from './HabitsDue'
import { MoodCheckIn } from './MoodCheckIn'
import { ScheduleTimeline } from './ScheduleTimeline'
import { ProgressSnapshot } from './ProgressSnapshot'
import { AIPlanButton } from './AIPlanButton'
import { LifePulse } from './LifePulse'
import { useDataStore, useAppStore } from '@/store'
import { PageWrapper } from '@/components/shared/PageWrapper'

const stagger = {
  animate: { transition: { staggerChildren: 0.055 } },
}
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning,'
  if (h < 17) return 'Good afternoon,'
  return 'Good evening,'
}

export function TodayView() {
  const { habits: storeHabits, todayTasks } = useDataStore()
  const { profile } = useAppStore()
  const firstName = profile.name.split(' ')[0]

  const habits = storeHabits
  const tasks = todayTasks

  const habitScore = Math.round(
    (habits.filter((h) => h.todayLog?.completed).length / Math.max(habits.length, 1)) * 100,
  )
  const taskScore = Math.round(
    (tasks.filter((t) => t.status === 'COMPLETED').length / Math.max(tasks.length, 1)) * 100,
  )
  const goalScore = 60

  const today = new Date()

  return (
    <PageWrapper>
      <div className="max-w-[1180px] mx-auto px-5 py-6">

        {/* Page header */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="mb-6"
        >
          <motion.div variants={fadeUp} className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 tracking-wide uppercase">
                {format(today, "EEEE, MMMM d · yyyy")}
              </p>
              <h1 className="text-[28px] font-black tracking-tight leading-tight">
                {getGreeting()} <span className="forge-gradient-text">{firstName}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {habitScore + taskScore > 100
                  ? "You're crushing it today 🔥"
                  : "Ready to forge today? Let's make it count."}
              </p>
            </div>
            <AIPlanButton />
          </motion.div>
        </motion.div>

        {/* Life Pulse hero */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="mb-5"
        >
          <motion.div variants={fadeUp}>
            <LifePulse habitScore={habitScore} taskScore={taskScore} goalScore={goalScore} />
          </motion.div>
        </motion.div>

        {/* Main grid */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 xl:grid-cols-3 gap-4"
        >
          {/* Left: main content */}
          <div className="xl:col-span-2 space-y-4">
            <motion.div variants={fadeUp}>
              <DailyFocus />
            </motion.div>

            <motion.div variants={fadeUp}>
              <PriorityTasks tasks={[]} />
            </motion.div>

            <motion.div variants={fadeUp}>
              <HabitsDue habits={[]} />
            </motion.div>
          </div>

          {/* Right: sidebar widgets */}
          <div className="space-y-4">
            <motion.div variants={fadeUp}>
              <MoodCheckIn />
            </motion.div>

            <motion.div variants={fadeUp}>
              <ProgressSnapshot />
            </motion.div>

            <motion.div variants={fadeUp}>
              <ScheduleTimeline timeBlocks={[]} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
