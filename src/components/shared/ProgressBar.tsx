'use client'

import { motion } from 'framer-motion'
import { cn, getProgressColor } from '@/lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  color?: string
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

export function ProgressBar({
  value,
  color,
  className,
  showLabel = false,
  size = 'sm',
  animate = true,
}: ProgressBarProps) {
  const barColor = color ?? getProgressColor(value)
  const height = size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2.5' : 'h-4'

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-muted overflow-hidden', height)}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={animate ? { width: 0 } : undefined}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
