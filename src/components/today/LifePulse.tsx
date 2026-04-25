'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

interface LifePulseProps {
  habitScore: number   // 0-100
  taskScore: number    // 0-100
  goalScore: number    // 0-100
}

function generateWave(
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
  phase: number,
  baseline: number,
): string {
  const points: [number, number][] = []
  const steps = 120
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width
    const y = baseline - Math.sin((i / steps) * Math.PI * 2 * frequency + phase) * amplitude
    points.push([x, Math.max(4, Math.min(height - 4, y))])
  }
  const path =
    `M ${points[0][0]} ${points[0][1]}` +
    points
      .slice(1)
      .map(([x, y], i) => {
        const prev = points[i]
        const cp1x = prev[0] + (x - prev[0]) / 3
        const cp2x = x - (x - prev[0]) / 3
        return `C ${cp1x} ${prev[1]} ${cp2x} ${y} ${x} ${y}`
      })
      .join(' ')
  return path
}

export function LifePulse({ habitScore, taskScore, goalScore }: LifePulseProps) {
  const W = 480
  const H = 80
  const [phase, setPhase] = useState(0)
  const rafRef = useRef<number>(0)
  const lastRef = useRef<number>(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const animate = (ts: number) => {
      const dt = (ts - lastRef.current) / 1000
      lastRef.current = ts
      setPhase((p) => p + dt * 0.6)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const momentum = Math.round((habitScore * 0.35 + taskScore * 0.4 + goalScore * 0.25))

  const h1 = H * (1 - habitScore / 100) * 0.6 + H * 0.2
  const h2 = H * (1 - taskScore / 100) * 0.6 + H * 0.2
  const h3 = H * (1 - goalScore / 100) * 0.6 + H * 0.2

  const wave1 = mounted ? generateWave(W, H, 10, 2.5, phase, h1) : ''
  const wave2 = mounted ? generateWave(W, H, 7, 3, phase * 1.3, h2) : ''
  const wave3 = mounted ? generateWave(W, H, 5, 1.8, phase * 0.8, h3) : ''

  const fillPath1 = wave1 ? wave1 + ` L ${W} ${H} L 0 ${H} Z` : ''
  const fillPath2 = wave2 ? wave2 + ` L ${W} ${H} L 0 ${H} Z` : ''
  const fillPath3 = wave3 ? wave3 + ` L ${W} ${H} L 0 ${H} Z` : ''

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-violet-500/5 to-purple-600/5 p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-5 h-5 rounded-md forge-gradient-bg flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Life Pulse
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-[240px]">
            Your real-time life momentum — habits, tasks &amp; goals combined
          </p>
        </div>

        <div className="text-right">
          <motion.div
            key={momentum}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="text-3xl font-black forge-gradient-text tabular-nums"
          >
            {momentum}
          </motion.div>
          <p className="text-[10px] text-muted-foreground">/ 100</p>
        </div>
      </div>

      {/* SVG waveform */}
      <div className="relative h-20 w-full overflow-hidden rounded-xl">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <linearGradient id="wave1-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="wave2-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="wave3-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Fill areas */}
          {fillPath3 && <path d={fillPath3} fill="url(#wave3-grad)" />}
          {fillPath2 && <path d={fillPath2} fill="url(#wave2-grad)" />}
          {fillPath1 && <path d={fillPath1} fill="url(#wave1-grad)" />}

          {/* Lines */}
          {wave3 && <path d={wave3} fill="none" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.5" />}
          {wave2 && <path d={wave2} fill="none" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.6" />}
          {wave1 && <path d={wave1} fill="none" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.85" />}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <LegendDot color="#6366f1" label="Tasks" value={taskScore} />
        <LegendDot color="#f97316" label="Habits" value={habitScore} />
        <LegendDot color="#10b981" label="Goals" value={goalScore} />
      </div>
    </div>
  )
}

function LegendDot({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[11px] font-semibold tabular-nums" style={{ color }}>{value}%</span>
    </div>
  )
}
