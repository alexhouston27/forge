import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, differenceInDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d, yyyy')
}

export function formatShortDate(date: Date | string): string {
  return format(new Date(date), 'MMM d')
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export function minutesToDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function daysUntil(date: Date | string): number {
  return differenceInDays(new Date(date), new Date())
}

export function getStreakLabel(streak: number): string {
  if (streak === 0) return 'No streak'
  if (streak === 1) return '1 day'
  if (streak < 7) return `${streak} days`
  if (streak < 30) return `${Math.floor(streak / 7)} weeks`
  return `${Math.floor(streak / 30)} months`
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return '#10b981'
  if (progress >= 50) return '#6366f1'
  if (progress >= 25) return '#f59e0b'
  return '#ef4444'
}

export function getEnergyColor(energy: string): string {
  switch (energy) {
    case 'HIGH': return '#10b981'
    case 'MEDIUM': return '#6366f1'
    case 'LOW': return '#f59e0b'
    default: return '#94a3b8'
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'URGENT': return '#ef4444'
    case 'HIGH': return '#f97316'
    case 'MEDIUM': return '#6366f1'
    case 'LOW': return '#94a3b8'
    default: return '#94a3b8'
  }
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    HEALTH: '#10b981',
    FITNESS: '#3b82f6',
    CAREER: '#6366f1',
    LEARNING: '#8b5cf6',
    FINANCE: '#f59e0b',
    RELATIONSHIPS: '#ec4899',
    CREATIVITY: '#f97316',
    PERSONAL: '#14b8a6',
    BUSINESS: '#6366f1',
    MINDFULNESS: '#a78bfa',
    PRODUCTIVITY: '#0ea5e9',
    SOCIAL: '#ec4899',
    OTHER: '#94a3b8',
  }
  return colors[category] ?? '#94a3b8'
}

export function computeLifeMomentumScore(stats: {
  taskCompletionRate: number
  habitConsistencyRate: number
  journalStreak: number
  goalsWithProgress: number
  totalGoals: number
}): number {
  const taskScore = stats.taskCompletionRate * 30
  const habitScore = stats.habitConsistencyRate * 30
  const journalScore = Math.min(stats.journalStreak / 7, 1) * 20
  const goalScore = stats.totalGoals > 0
    ? (stats.goalsWithProgress / stats.totalGoals) * 20
    : 0

  return Math.round(taskScore + habitScore + journalScore + goalScore)
}

export function xpForLevel(level: number): number {
  return level * level * 100
}

export function levelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key])
    return { ...result, [group]: [...(result[group] ?? []), item] }
  }, {} as Record<string, T[]>)
}

export const CATEGORY_EMOJIS: Record<string, string> = {
  HEALTH: '💪',
  FITNESS: '🏋️',
  CAREER: '💼',
  LEARNING: '📚',
  FINANCE: '💰',
  RELATIONSHIPS: '❤️',
  CREATIVITY: '🎨',
  PERSONAL: '⭐',
  BUSINESS: '🚀',
  MINDFULNESS: '🧘',
  PRODUCTIVITY: '⚡',
  SOCIAL: '🤝',
  OTHER: '✨',
}
