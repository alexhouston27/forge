'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Flame, Target, TrendingUp } from 'lucide-react'

const DEMO_STATS = {
  tasksCompleted: 3,
  tasksTotal: 7,
  habitsCompleted: 4,
  habitsTotal: 6,
  activeGoals: 5,
  goalProgress: 60,
  weekScore: 74,
  lifeMomentum: 82,
}

interface RingProps {
  value: number
  color: string
  size?: number
  stroke?: number
}

function AnimatedRing({ value, color, size = 44, stroke = 4 }: RingProps) {
  const [animated, setAnimated] = useState(0)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 80)
    return () => clearTimeout(t)
  }, [value])

  const dash = (animated / 100) * circumference

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - dash }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

export function ProgressSnapshot() {
  const taskPct = Math.round((DEMO_STATS.tasksCompleted / DEMO_STATS.tasksTotal) * 100)
  const habitPct = Math.round((DEMO_STATS.habitsCompleted / DEMO_STATS.habitsTotal) * 100)

  return (
    <div className="card-base p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Progress</h2>
      </div>

      {/* Life momentum */}
      <div className="flex items-center gap-3 mb-4 p-3.5 rounded-xl bg-primary/5 border border-primary/15">
        <div className="relative">
          <AnimatedRing value={DEMO_STATS.lifeMomentum} color="#6366f1" size={48} stroke={4.5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black forge-gradient-text tabular-nums">
              {DEMO_STATS.lifeMomentum}
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold">Life Momentum</p>
          <p className="text-[11px] text-muted-foreground">
            {DEMO_STATS.lifeMomentum >= 80 ? 'On fire 🔥' : DEMO_STATS.lifeMomentum >= 60 ? 'Good pace 💪' : 'Keep going ⚡'}
          </p>
        </div>
      </div>

      {/* Stats with rings */}
      <div className="space-y-3">
        <StatRing
          icon={<CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
          label="Tasks"
          value={`${DEMO_STATS.tasksCompleted}/${DEMO_STATS.tasksTotal}`}
          pct={taskPct}
          color="#6366f1"
        />
        <StatRing
          icon={<Flame className="w-3.5 h-3.5 text-orange-500" />}
          label="Habits"
          value={`${DEMO_STATS.habitsCompleted}/${DEMO_STATS.habitsTotal}`}
          pct={habitPct}
          color="#f97316"
        />
        <StatRing
          icon={<Target className="w-3.5 h-3.5 text-emerald-500" />}
          label="Goals"
          value={`${DEMO_STATS.activeGoals} active`}
          pct={DEMO_STATS.goalProgress}
          color="#10b981"
        />
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Week score</span>
        <div className="flex items-baseline gap-1">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm font-bold tabular-nums"
          >
            {DEMO_STATS.weekScore}
          </motion.span>
          <span className="text-[11px] text-muted-foreground">/100</span>
        </div>
      </div>
    </div>
  )
}

function StatRing({
  icon,
  label,
  value,
  pct,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  pct: number
  color: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <AnimatedRing value={pct} color={color} size={32} stroke={3} />
        <div className="absolute inset-0 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-between">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-[11px] text-muted-foreground tabular-nums">{value}</span>
      </div>
    </div>
  )
}
