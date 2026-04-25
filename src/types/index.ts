// FORGE — Core Type Definitions

export type {
  User,
  Goal,
  Milestone,
  Habit,
  HabitLog,
  Task,
  DailyPlan,
  TimeBlock,
  JournalEntry,
  WeeklyReview,
  Note,
  MoodLog,
} from '@prisma/client'

export type {
  GoalCategory,
  GoalStatus,
  MilestoneStatus,
  HabitCategory,
  HabitFrequency,
  HabitTrackingType,
  TaskStatus,
  TaskPriority,
  EnergyLevel,
  JournalType,
  NoteType,
} from '@prisma/client'

// ─── Extended / Composed Types ─────────────────────────────────────────────────

export interface GoalWithRelations {
  id: string
  title: string
  description?: string | null
  category: string
  status: string
  priority: number
  targetDate?: Date | null
  progress: number
  color: string
  emoji?: string | null
  createdAt: Date
  updatedAt: Date
  milestones: MilestoneItem[]
  habits: HabitItem[]
  tasks: TaskItem[]
}

export interface MilestoneItem {
  id: string
  goalId: string
  title: string
  description?: string | null
  status: string
  dueDate?: Date | null
  completedAt?: Date | null
  order: number
}

export interface HabitItem {
  id: string
  title: string
  category: string
  frequency: string
  trackingType: string
  targetValue?: number | null
  unit?: string | null
  color: string
  emoji?: string | null
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  isActive: boolean
  goalId?: string | null
}

export interface HabitWithLog extends HabitItem {
  todayLog?: {
    completed: boolean
    value?: number | null
  } | null
}

export interface TaskItem {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  energy?: string | null
  estimatedMinutes?: number | null
  scheduledFor?: Date | null
  scheduledTime?: string | null
  completedAt?: Date | null
  dueDate?: Date | null
  tags: string[]
  goalId?: string | null
}

export interface DailyPlanWithRelations {
  id: string
  userId: string
  date: Date
  mainFocus?: string | null
  aiGenerated: boolean
  notes?: string | null
  productivityScore?: number | null
  energyScore?: number | null
  moodScore?: number | null
  tasks: TaskItem[]
  timeBlocks: TimeBlockItem[]
}

export interface TimeBlockItem {
  id: string
  dailyPlanId: string
  title: string
  startTime: string
  endTime: string
  category?: string | null
  color: string
  isCompleted: boolean
}

export interface NoteItem {
  id: string
  title: string
  content: string
  type: string
  tags: string[]
  isPinned: boolean
  isFavorite: boolean
  color?: string | null
  goalId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface JournalEntryItem {
  id: string
  date: Date
  type: string
  wins?: string | null
  mistakes?: string | null
  lessons?: string | null
  tomorrowFocus?: string | null
  gratitude?: string | null
  freeWrite?: string | null
  overallScore?: number | null
  mood?: string | null
  energy?: number | null
}

// ─── UI / App Types ────────────────────────────────────────────────────────────

export interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
  badge?: number
}

export interface CommandItem {
  id: string
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  action: () => void
  keywords?: string[]
  group?: string
  shortcut?: string[]
}

export interface AnalyticsSummary {
  tasksCompleted: number
  taskCompletionRate: number
  habitsCompleted: number
  habitConsistencyRate: number
  currentStreakDays: number
  goalsActive: number
  goalsCompleted: number
  journalDaysCurrent: number
  lifeMomentumScore: number
  weeklyXP: number
  totalXP: number
  level: number
}

export interface WeeklyStats {
  week: string
  tasksCompleted: number
  habitsCompleted: number
  journalEntries: number
  score: number
}

export interface AIScheduleRequest {
  workHours: { start: string; end: string }
  tasks: TaskItem[]
  preferences: string
  energyPeak?: 'morning' | 'afternoon' | 'evening'
}

export interface AIScheduleResponse {
  timeBlocks: Omit<TimeBlockItem, 'id' | 'dailyPlanId' | 'isCompleted'>[]
  mainFocus: string
  priorities: string[]
  insights: string[]
}

export type MoodEmoji = '😤' | '😕' | '😐' | '🙂' | '😄'
export const MOOD_LABELS = ['Rough', 'Low', 'Neutral', 'Good', 'Great'] as const
export const MOOD_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#6366f1'] as const
