import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp, arrayUnion, arrayRemove,
  query, orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import { format, subDays, parseISO, differenceInDays } from 'date-fns'
import type { HabitWithLog, TaskItem, GoalWithRelations, NoteItem, JournalEntryItem } from '@/types'

function userCol(uid: string, col: string) {
  return collection(db, 'users', uid, col)
}

function userDoc(uid: string, col: string, id: string) {
  return doc(db, 'users', uid, col, id)
}

function computeCurrentStreak(dates: string[]): number {
  if (!dates.length) return 0
  const sorted = [...dates].sort().reverse()
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInDays(parseISO(sorted[i - 1]), parseISO(sorted[i]))
    if (diff === 1) streak++
    else break
  }
  return streak
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export function subscribeToHabits(uid: string, cb: (habits: HabitWithLog[]) => void) {
  const q = query(userCol(uid, 'habits'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const habits: HabitWithLog[] = snap.docs.map((d) => {
      const data = d.data()
      const completedDates: string[] = data.completedDates ?? []
      const currentStreak = computeCurrentStreak(completedDates)
      return {
        id: d.id,
        title: data.title,
        category: data.category ?? 'OTHER',
        frequency: data.frequency ?? 'DAILY',
        trackingType: data.trackingType ?? 'BINARY',
        color: data.color ?? '#6366f1',
        emoji: data.emoji ?? null,
        currentStreak,
        longestStreak: Math.max(data.longestStreak ?? 0, currentStreak),
        totalCompletions: completedDates.length,
        isActive: data.isActive ?? true,
        goalId: data.goalId ?? null,
        completedDates,
        todayLog: { completed: completedDates.includes(today) },
      }
    })
    cb(habits)
  })
}

export async function addHabit(uid: string, data: { title: string; category: string; color: string; emoji?: string; frequency?: string }) {
  const ref = await addDoc(userCol(uid, 'habits'), {
    title: data.title,
    category: data.category,
    frequency: data.frequency ?? 'DAILY',
    trackingType: 'BINARY',
    color: data.color,
    emoji: data.emoji ?? null,
    isActive: true,
    completedDates: [],
    longestStreak: 0,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function toggleHabitDate(uid: string, habitId: string, completed: boolean) {
  const today = format(new Date(), 'yyyy-MM-dd')
  await updateDoc(userDoc(uid, 'habits', habitId), {
    completedDates: completed ? arrayUnion(today) : arrayRemove(today),
  })
}

export async function deleteHabit(uid: string, habitId: string) {
  await deleteDoc(userDoc(uid, 'habits', habitId))
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export function subscribeToTasks(uid: string, cb: (tasks: TaskItem[]) => void) {
  const q = query(userCol(uid, 'tasks'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const tasks: TaskItem[] = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        title: data.title,
        description: data.description ?? null,
        status: data.status ?? 'TODO',
        priority: data.priority ?? 'MEDIUM',
        energy: data.energy ?? null,
        estimatedMinutes: data.estimatedMinutes ?? null,
        scheduledFor: data.scheduledFor ?? null,
        scheduledTime: data.scheduledTime ?? null,
        completedAt: data.completedAt ?? null,
        dueDate: data.dueDate ?? null,
        tags: data.tags ?? [],
        goalId: data.goalId ?? null,
      }
    })
    cb(tasks)
  })
}

export async function addTask(uid: string, data: { title: string; priority?: string; tags?: string[]; scheduledFor?: string; goalId?: string }) {
  const ref = await addDoc(userCol(uid, 'tasks'), {
    title: data.title,
    status: 'TODO',
    priority: data.priority ?? 'MEDIUM',
    tags: data.tags ?? [],
    scheduledFor: data.scheduledFor ?? format(new Date(), 'yyyy-MM-dd'),
    goalId: data.goalId ?? null,
    completedAt: null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTask(uid: string, taskId: string, updates: Partial<TaskItem>) {
  const { id, ...rest } = updates as TaskItem
  void id
  await updateDoc(userDoc(uid, 'tasks', taskId), {
    ...rest,
    ...(updates.status === 'DONE' && !updates.completedAt
      ? { completedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss") }
      : {}),
  })
}

export async function deleteTask(uid: string, taskId: string) {
  await deleteDoc(userDoc(uid, 'tasks', taskId))
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export function subscribeToGoals(uid: string, cb: (goals: GoalWithRelations[]) => void) {
  const q = query(userCol(uid, 'goals'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const goals: GoalWithRelations[] = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        title: data.title,
        description: data.description ?? null,
        category: data.category ?? 'PERSONAL',
        status: data.status ?? 'ACTIVE',
        priority: data.priority ?? 1,
        targetDate: data.targetDate ?? null,
        progress: data.progress ?? 0,
        color: data.color ?? '#6366f1',
        emoji: data.emoji ?? null,
        milestones: data.milestones ?? [],
        habits: [],
        tasks: [],
        createdAt: data.createdAt?.toDate() ?? new Date(),
        updatedAt: data.updatedAt?.toDate() ?? new Date(),
      }
    })
    cb(goals)
  })
}

export async function addGoal(uid: string, data: Partial<GoalWithRelations>) {
  const ref = await addDoc(userCol(uid, 'goals'), {
    title: data.title,
    description: data.description ?? null,
    category: data.category ?? 'PERSONAL',
    status: 'ACTIVE',
    priority: data.priority ?? 1,
    targetDate: data.targetDate ?? null,
    progress: 0,
    color: data.color ?? '#6366f1',
    emoji: data.emoji ?? null,
    milestones: data.milestones ?? [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateGoal(uid: string, goalId: string, updates: Partial<GoalWithRelations>) {
  const { id, habits, tasks, createdAt, ...rest } = updates as GoalWithRelations
  void id; void habits; void tasks; void createdAt
  await updateDoc(userDoc(uid, 'goals', goalId), { ...rest, updatedAt: serverTimestamp() })
}

export async function deleteGoal(uid: string, goalId: string) {
  await deleteDoc(userDoc(uid, 'goals', goalId))
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export function subscribeToNotes(uid: string, cb: (notes: NoteItem[]) => void) {
  const q = query(userCol(uid, 'notes'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const notes: NoteItem[] = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        title: data.title,
        content: data.content ?? '',
        type: data.type ?? 'NOTE',
        tags: data.tags ?? [],
        isPinned: data.isPinned ?? false,
        isFavorite: data.isFavorite ?? false,
        color: data.color ?? null,
        goalId: data.goalId ?? null,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        updatedAt: data.updatedAt?.toDate() ?? new Date(),
      }
    })
    cb(notes)
  })
}

export async function addNote(uid: string, data: { title: string; content: string; type: string; tags?: string[] }) {
  const ref = await addDoc(userCol(uid, 'notes'), {
    title: data.title,
    content: data.content,
    type: data.type,
    tags: data.tags ?? [],
    isPinned: false,
    isFavorite: false,
    color: null,
    goalId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateNote(uid: string, noteId: string, updates: Partial<NoteItem>) {
  const { id, createdAt, ...rest } = updates as NoteItem
  void id; void createdAt
  await updateDoc(userDoc(uid, 'notes', noteId), { ...rest, updatedAt: serverTimestamp() })
}

export async function deleteNote(uid: string, noteId: string) {
  await deleteDoc(userDoc(uid, 'notes', noteId))
}

// ─── Journal ─────────────────────────────────────────────────────────────────

export function subscribeToJournalEntry(uid: string, date: string, cb: (entry: JournalEntryItem | null) => void) {
  return onSnapshot(userDoc(uid, 'journal', date), (snap) => {
    if (!snap.exists()) { cb(null); return }
    const data = snap.data()
    cb({ id: snap.id, date, type: data.type ?? 'DAILY', ...data } as JournalEntryItem)
  })
}

export async function saveJournalEntry(uid: string, date: string, data: Partial<JournalEntryItem>) {
  const { id, ...rest } = data as JournalEntryItem
  void id
  await updateDoc(userDoc(uid, 'journal', date), { ...rest, updatedAt: serverTimestamp() })
    .catch(async () => {
      const { setDoc } = await import('firebase/firestore')
      await setDoc(userDoc(uid, 'journal', date), { ...rest, date, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    })
}
