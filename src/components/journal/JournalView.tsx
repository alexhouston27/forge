'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { format, startOfWeek } from 'date-fns'
import { motion } from 'framer-motion'
import { BookOpen, Star, Zap, AlertCircle, Lightbulb, ChevronRight, Save, History, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { PageWrapper } from '@/components/shared/PageWrapper'
import {
  subscribeToJournalEntry,
  subscribeToAllJournalEntries,
  saveJournalEntry,
  saveWeeklyReview,
  subscribeToWeeklyReview,
} from '@/lib/firestore-data'
import type { JournalEntryItem } from '@/types'

interface JournalSection {
  key: string
  icon: React.ReactNode
  prompt: string
  placeholder: string
  color: string
}

const DAILY_SECTIONS: JournalSection[] = [
  { key: 'wins', icon: <Star className="w-4 h-4" />, prompt: "Today's wins", placeholder: "What went well? What are you proud of? Even small wins count...", color: '#f59e0b' },
  { key: 'mistakes', icon: <AlertCircle className="w-4 h-4" />, prompt: "Mistakes & challenges", placeholder: "What didn't go as planned? What obstacles did you face?", color: '#ef4444' },
  { key: 'lessons', icon: <Lightbulb className="w-4 h-4" />, prompt: "Key lessons", placeholder: "What did you learn today? What insight are you taking forward?", color: '#8b5cf6' },
  { key: 'tomorrowFocus', icon: <ChevronRight className="w-4 h-4" />, prompt: "Tomorrow's focus", placeholder: "What is the one thing you MUST do tomorrow?", color: '#6366f1' },
  { key: 'gratitude', icon: <Star className="w-4 h-4" />, prompt: "Gratitude", placeholder: "Three things you're grateful for today...", color: '#10b981' },
]

const MOOD_SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const TODAY = format(new Date(), 'yyyy-MM-dd')
const WEEK_STR = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

const WEEKLY_SECTIONS = [
  { key: 'movedForward', label: '✅ What moved forward?', placeholder: 'Goals, habits, projects that progressed this week...' },
  { key: 'stalled', label: '⚠️ What stalled?', placeholder: 'What got stuck or fell behind? Be honest...' },
  { key: 'improvements', label: '🔧 What to improve?', placeholder: 'Systems, routines, behaviors to change next week...' },
  { key: 'nextWeekFocus', label: "🎯 Next week's priority", placeholder: 'The one thing that will make next week a success...' },
]

export function JournalView() {
  const { showNotification } = useAppStore()
  const { user } = useAuth()
  const uid = user?.uid

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'history'>('daily')

  // ── Daily state ──────────────────────────────────────────────────────────────
  const [entries, setEntries] = useState<Record<string, string>>({ wins: '', mistakes: '', lessons: '', tomorrowFocus: '', gratitude: '', freeWrite: '' })
  const [overallScore, setOverallScore] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDirty = useRef(false)

  // ── Weekly state ─────────────────────────────────────────────────────────────
  const [weeklyEntries, setWeeklyEntries] = useState<Record<string, string>>({ movedForward: '', stalled: '', improvements: '', nextWeekFocus: '' })
  const [weeklySaving, setWeeklySaving] = useState(false)
  const [weeklySavedAt, setWeeklySavedAt] = useState<Date | null>(null)
  const weeklyDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isWeeklyDirty = useRef(false)

  // ── History state ────────────────────────────────────────────────────────────
  const [historyEntries, setHistoryEntries] = useState<JournalEntryItem[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryItem | null>(null)

  // Load today's journal entry
  useEffect(() => {
    if (!uid) return
    const unsub = subscribeToJournalEntry(uid, TODAY, (entry) => {
      if (!entry) return
      setEntries({
        wins: entry.wins ?? '',
        mistakes: entry.mistakes ?? '',
        lessons: entry.lessons ?? '',
        tomorrowFocus: entry.tomorrowFocus ?? '',
        gratitude: entry.gratitude ?? '',
        freeWrite: entry.freeWrite ?? '',
      })
      setOverallScore(entry.overallScore ?? null)
      isDirty.current = false
    })
    return unsub
  }, [uid])

  // Load this week's review
  useEffect(() => {
    if (!uid) return
    const unsub = subscribeToWeeklyReview(uid, WEEK_STR, (data) => {
      if (!data) return
      setWeeklyEntries({
        movedForward: data.movedForward ?? '',
        stalled: data.stalled ?? '',
        improvements: data.improvements ?? '',
        nextWeekFocus: data.nextWeekFocus ?? '',
      })
      isWeeklyDirty.current = false
    })
    return unsub
  }, [uid])

  // Load history when tab is opened
  useEffect(() => {
    if (activeTab !== 'history' || !uid) return
    const unsub = subscribeToAllJournalEntries(uid, setHistoryEntries)
    return unsub
  }, [activeTab, uid])

  // Auto-save daily after 1.5s of inactivity
  const scheduleSave = useCallback((data: Record<string, string>, score: number | null) => {
    if (!uid) return
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(async () => {
      setSaving(true)
      try {
        await saveJournalEntry(uid, TODAY, { ...data, overallScore: score ?? undefined, type: 'DAILY' })
        setSavedAt(new Date())
        isDirty.current = false
      } catch {
        // silent — manual save still available
      } finally {
        setSaving(false)
      }
    }, 1500)
  }, [uid])

  function handleChange(key: string, value: string) {
    const next = { ...entries, [key]: value }
    setEntries(next)
    isDirty.current = true
    scheduleSave(next, overallScore)
  }

  function handleScoreChange(score: number) {
    setOverallScore(score)
    isDirty.current = true
    scheduleSave(entries, score)
  }

  async function handleManualSave() {
    if (!uid) return
    setSaving(true)
    try {
      await saveJournalEntry(uid, TODAY, { ...entries, overallScore: overallScore ?? undefined, type: 'DAILY' })
      setSavedAt(new Date())
      isDirty.current = false
      showNotification('Journal saved ✓')
    } catch {
      showNotification('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Auto-save weekly
  const scheduleWeeklySave = useCallback((data: Record<string, string>) => {
    if (!uid) return
    if (weeklyDebounce.current) clearTimeout(weeklyDebounce.current)
    weeklyDebounce.current = setTimeout(async () => {
      setWeeklySaving(true)
      try {
        await saveWeeklyReview(uid, WEEK_STR, data)
        setWeeklySavedAt(new Date())
        isWeeklyDirty.current = false
      } catch {
        // silent
      } finally {
        setWeeklySaving(false)
      }
    }, 1500)
  }, [uid])

  function handleWeeklyChange(key: string, value: string) {
    const next = { ...weeklyEntries, [key]: value }
    setWeeklyEntries(next)
    isWeeklyDirty.current = true
    scheduleWeeklySave(next)
  }

  async function handleWeeklyManualSave() {
    if (!uid) return
    setWeeklySaving(true)
    try {
      await saveWeeklyReview(uid, WEEK_STR, weeklyEntries)
      setWeeklySavedAt(new Date())
      showNotification('Weekly review saved ✓')
    } catch {
      showNotification('Failed to save', 'error')
    } finally {
      setWeeklySaving(false)
    }
  }

  const filledSections = DAILY_SECTIONS.filter((s) => entries[s.key]?.trim()).length
  const completionRate = Math.round((filledSections / DAILY_SECTIONS.length) * 100)

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Journal
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          {activeTab === 'daily' && (
            <div className="flex items-center gap-2">
              {savedAt && !saving && (
                <span className="text-xs text-muted-foreground">
                  Saved {format(savedAt, 'h:mm a')}
                </span>
              )}
              <Button onClick={handleManualSave} disabled={saving} className="gap-2" size="sm">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
          {activeTab === 'weekly' && (
            <div className="flex items-center gap-2">
              {weeklySavedAt && !weeklySaving && (
                <span className="text-xs text-muted-foreground">
                  Saved {format(weeklySavedAt, 'h:mm a')}
                </span>
              )}
              <Button onClick={handleWeeklyManualSave} disabled={weeklySaving} className="gap-2" size="sm">
                <Save className="w-4 h-4" />
                {weeklySaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-xl p-1 mb-6 w-fit gap-1">
          {(['daily', 'weekly', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 capitalize flex items-center gap-1.5',
                activeTab === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab === 'history' && <History className="w-3.5 h-3.5" />}
              {tab === 'daily' ? 'Daily Review' : tab === 'weekly' ? 'Weekly Review' : 'History'}
            </button>
          ))}
        </div>

        {activeTab === 'daily' && (
          <div className="space-y-5">
            {/* Progress */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Reflection progress</span>
                  <span className="font-medium">{filledSections}/{DAILY_SECTIONS.length}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${completionRate}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>
            </div>

            {DAILY_SECTIONS.map((section) => (
              <SectionCard
                key={section.key}
                section={section}
                value={entries[section.key] ?? ''}
                onChange={(val) => handleChange(section.key, val)}
              />
            ))}

            {/* Free write */}
            <div className="forge-card">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Free write</span>
                <span className="text-xs text-muted-foreground ml-auto">anything on your mind</span>
              </div>
              <textarea
                value={entries.freeWrite ?? ''}
                onChange={(e) => handleChange('freeWrite', e.target.value)}
                placeholder="Stream of consciousness... no filters, no rules."
                rows={5}
                className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground/40 leading-relaxed"
              />
            </div>

            {/* Day score */}
            <div className="forge-card">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold">Rate today</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {MOOD_SCORES.map((score) => (
                  <button
                    key={score}
                    onClick={() => handleScoreChange(score)}
                    className={cn(
                      'w-10 h-10 rounded-xl text-sm font-bold transition-all duration-150',
                      overallScore === score
                        ? 'bg-primary text-primary-foreground scale-110 shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                    )}
                  >
                    {score}
                  </button>
                ))}
              </div>
              {overallScore && (
                <p className="text-xs text-muted-foreground mt-2">
                  {overallScore >= 8 ? '🔥 Excellent day!' : overallScore >= 6 ? '👍 Solid day' : overallScore >= 4 ? '😐 Average day' : '💪 Tomorrow is a new chance'}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Weekly review for the week of {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </p>
            {WEEKLY_SECTIONS.map((section) => (
              <div key={section.key} className="forge-card">
                <p className="text-sm font-semibold mb-3">{section.label}</p>
                <textarea
                  value={weeklyEntries[section.key] ?? ''}
                  onChange={(e) => handleWeeklyChange(section.key, e.target.value)}
                  placeholder={section.placeholder}
                  rows={4}
                  className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground/40 leading-relaxed"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <HistoryTab entries={historyEntries} selected={selectedEntry} onSelect={setSelectedEntry} />
        )}
      </div>
    </PageWrapper>
  )
}

function SectionCard({ section, value, onChange }: { section: JournalSection; value: string; onChange: (val: string) => void }) {
  return (
    <div className="forge-card group">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${section.color}20`, color: section.color }}>
          {section.icon}
        </div>
        <span className="text-sm font-semibold">{section.prompt}</span>
        {value.trim() && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={section.placeholder}
        rows={4}
        className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground/40 leading-relaxed"
      />
    </div>
  )
}

function HistoryTab({
  entries,
  selected,
  onSelect,
}: {
  entries: JournalEntryItem[]
  selected: JournalEntryItem | null
  onSelect: (e: JournalEntryItem | null) => void
}) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No past entries yet. Start writing your daily review!</p>
      </div>
    )
  }

  if (selected) {
    return (
      <div>
        <button onClick={() => onSelect(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          Back to history
        </button>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">{format(new Date(selected.date + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}</h2>
            {selected.overallScore && (
              <span className="ml-auto text-sm font-bold text-primary">{selected.overallScore}/10</span>
            )}
          </div>
          {DAILY_SECTIONS.map((s) => {
            const val = selected[s.key as keyof JournalEntryItem] as string | null
            if (!val?.trim()) return null
            return (
              <div key={s.key} className="forge-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-[11px]" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                    {s.icon}
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{s.prompt}</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{val}</p>
              </div>
            )
          })}
          {selected.freeWrite?.trim() && (
            <div className="forge-card">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Free write</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.freeWrite}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const filledCount = DAILY_SECTIONS.filter((s) => (entry[s.key as keyof JournalEntryItem] as string | null)?.trim()).length
        const hasContent = filledCount > 0 || entry.freeWrite?.trim()
        return (
          <button
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="w-full forge-card text-left hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{format(new Date(entry.date + 'T12:00:00'), 'EEEE, MMM d')}</p>
                  <p className="text-xs text-muted-foreground">
                    {hasContent ? `${filledCount} section${filledCount !== 1 ? 's' : ''} completed` : 'No content'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {entry.overallScore && (
                  <span className="text-sm font-bold text-primary">{entry.overallScore}/10</span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
