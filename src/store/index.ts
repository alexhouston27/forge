import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import type { GoalWithRelations, HabitWithLog, TaskItem, NoteItem, JournalEntryItem } from '@/types'

// ─── App Store ────────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string
  email: string
  bio: string
  avatarColor: string
  timezone: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  workHoursStart: string
  workHoursEnd: string
  energyPeak: 'morning' | 'afternoon' | 'evening'
  weekStartsOn: 'monday' | 'sunday'
  notifications: {
    habitReminders: boolean
    weeklyReview: boolean
    aiInsights: boolean
    goalDeadlines: boolean
    dailyDigest: boolean
  }
}

interface AppState {
  // Command palette
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void

  // Quick capture modal
  quickCaptureOpen: boolean
  quickCaptureType: 'task' | 'note' | 'idea'
  openQuickCapture: (type?: 'task' | 'note' | 'idea') => void
  closeQuickCapture: () => void

  // Focus mode
  focusModeActive: boolean
  toggleFocusMode: () => void

  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // Current daily focus
  dailyFocus: string
  setDailyFocus: (focus: string) => void

  // Mood today
  todayMood: number | null
  todayEnergy: number | null
  setTodayMood: (mood: number) => void
  setTodayEnergy: (energy: number) => void

  // Notification toast
  notification: { message: string; type: 'success' | 'error' | 'info' } | null
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void
  clearNotification: () => void

  // User profile
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void

  // Preferences
  preferences: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => void
  updateNotificationPreferences: (updates: Partial<UserPreferences['notifications']>) => void
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Houston',
  email: 'alexhouston1105@gmail.com',
  bio: '',
  avatarColor: '#6366f1',
  timezone: 'America/New_York',
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  accentColor: '#6366f1',
  workHoursStart: '09:00',
  workHoursEnd: '17:00',
  energyPeak: 'morning',
  weekStartsOn: 'monday',
  notifications: {
    habitReminders: true,
    weeklyReview: true,
    aiInsights: true,
    goalDeadlines: true,
    dailyDigest: false,
  },
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        commandPaletteOpen: false,
        setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

        quickCaptureOpen: false,
        quickCaptureType: 'task',
        openQuickCapture: (type = 'task') =>
          set({ quickCaptureOpen: true, quickCaptureType: type }),
        closeQuickCapture: () => set({ quickCaptureOpen: false }),

        focusModeActive: false,
        toggleFocusMode: () => set((s) => ({ focusModeActive: !s.focusModeActive })),

        sidebarCollapsed: false,
        toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

        dailyFocus: '',
        setDailyFocus: (focus) => set({ dailyFocus: focus }),

        todayMood: null,
        todayEnergy: null,
        setTodayMood: (mood) => set({ todayMood: mood }),
        setTodayEnergy: (energy) => set({ todayEnergy: energy }),

        notification: null,
        showNotification: (message, type = 'success') =>
          set({ notification: { message, type } }),
        clearNotification: () => set({ notification: null }),

        profile: DEFAULT_PROFILE,
        updateProfile: (updates) =>
          set((s) => ({ profile: { ...s.profile, ...updates } })),

        preferences: DEFAULT_PREFERENCES,
        updatePreferences: (updates) =>
          set((s) => ({ preferences: { ...s.preferences, ...updates } })),
        updateNotificationPreferences: (updates) =>
          set((s) => ({
            preferences: {
              ...s.preferences,
              notifications: { ...s.preferences.notifications, ...updates },
            },
          })),
      }),
      {
        name: 'forge-app',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          dailyFocus: state.dailyFocus,
          todayMood: state.todayMood,
          todayEnergy: state.todayEnergy,
          profile: state.profile,
          preferences: state.preferences,
        }),
      },
    ),
  ),
)

// ─── Data Cache Store ─────────────────────────────────────────────────────────

interface DataState {
  goals: GoalWithRelations[]
  habits: HabitWithLog[]
  tasks: TaskItem[]
  todayTasks: TaskItem[]
  notes: NoteItem[]
  todayJournal: JournalEntryItem | null

  setGoals: (goals: GoalWithRelations[]) => void
  setHabits: (habits: HabitWithLog[]) => void
  setTasks: (tasks: TaskItem[]) => void
  setTodayTasks: (tasks: TaskItem[]) => void
  setNotes: (notes: NoteItem[]) => void
  setTodayJournal: (entry: JournalEntryItem | null) => void

  // Optimistic updates
  addTask: (task: TaskItem) => void
  updateTask: (id: string, updates: Partial<TaskItem>) => void
  removeTask: (id: string) => void
  addNote: (note: NoteItem) => void
  updateNote: (id: string, updates: Partial<NoteItem>) => void
  removeNote: (id: string) => void
  addHabit: (habit: HabitWithLog) => void
  toggleHabit: (habitId: string, completed: boolean) => void
  addGoal: (goal: GoalWithRelations) => void
  updateGoal: (id: string, updates: Partial<GoalWithRelations>) => void
  removeGoal: (id: string) => void
}

export const useDataStore = create<DataState>((set) => ({
  goals: [],
  habits: [],
  tasks: [],
  todayTasks: [],
  notes: [],
  todayJournal: null,

  setGoals: (goals) => set({ goals }),
  setHabits: (habits) => set({ habits }),
  setTasks: (tasks) => set({ tasks }),
  setTodayTasks: (tasks) => set({ todayTasks: tasks }),
  setNotes: (notes) => set({ notes }),
  setTodayJournal: (entry) => set({ todayJournal: entry }),

  addTask: (task) =>
    set((s) => ({ tasks: [task, ...s.tasks], todayTasks: [task, ...s.todayTasks] })),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      todayTasks: s.todayTasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) =>
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== id),
      todayTasks: s.todayTasks.filter((t) => t.id !== id),
    })),
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  updateNote: (id, updates) =>
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)) })),
  removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
  addHabit: (habit) => set((s) => ({ habits: [...s.habits, habit] })),
  toggleHabit: (habitId, completed) =>
    set((s) => ({
      habits: s.habits.map((h) =>
        h.id === habitId
          ? { ...h, todayLog: { completed, value: h.todayLog?.value } }
          : h,
      ),
    })),
  addGoal: (goal) => set((s) => ({ goals: [goal, ...s.goals] })),
  updateGoal: (id, updates) =>
    set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)) })),
  removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
}))
