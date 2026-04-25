'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { BookOpen, Star, Zap, AlertCircle, Lightbulb, ChevronRight, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'
import { PageWrapper } from '@/components/shared/PageWrapper'

interface JournalSection {
  key: string
  icon: React.ReactNode
  prompt: string
  placeholder: string
  color: string
}

const DAILY_SECTIONS: JournalSection[] = [
  {
    key: 'wins',
    icon: <Star className="w-4 h-4" />,
    prompt: "Today's wins",
    placeholder: "What went well? What are you proud of? Even small wins count...",
    color: '#f59e0b',
  },
  {
    key: 'mistakes',
    icon: <AlertCircle className="w-4 h-4" />,
    prompt: "Mistakes & challenges",
    placeholder: "What didn't go as planned? What obstacles did you face?",
    color: '#ef4444',
  },
  {
    key: 'lessons',
    icon: <Lightbulb className="w-4 h-4" />,
    prompt: "Key lessons",
    placeholder: "What did you learn today? What insight are you taking forward?",
    color: '#8b5cf6',
  },
  {
    key: 'tomorrowFocus',
    icon: <ChevronRight className="w-4 h-4" />,
    prompt: "Tomorrow's focus",
    placeholder: "What is the one thing you MUST do tomorrow?",
    color: '#6366f1',
  },
  {
    key: 'gratitude',
    icon: <Star className="w-4 h-4" />,
    prompt: "Gratitude",
    placeholder: "Three things you're grateful for today...",
    color: '#10b981',
  },
]

const MOOD_SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function JournalView() {
  const { showNotification } = useAppStore()
  const [entries, setEntries] = useState<Record<string, string>>({
    wins: '',
    mistakes: '',
    lessons: '',
    tomorrowFocus: '',
    gratitude: '',
    freeWrite: '',
  })
  const [overallScore, setOverallScore] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily')

  function handleChange(key: string, value: string) {
    setEntries((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    // In production: POST to /api/journal
    setSaved(true)
    showNotification('Journal saved ✓')
    setTimeout(() => setSaved(false), 3000)
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
          <Button onClick={handleSave} className="gap-2" variant={saved ? 'outline' : 'default'}>
            <Save className="w-4 h-4" />
            {saved ? 'Saved ✓' : 'Save'}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-muted rounded-xl p-1 mb-6 w-fit gap-1">
        {(['daily', 'weekly'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 capitalize',
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab} Review
          </button>
        ))}
      </div>

      {activeTab === 'daily' ? (
        <div className="space-y-5">
          {/* Completion indicator */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Reflection progress</span>
                <span className="font-medium">{filledSections}/{DAILY_SECTIONS.length}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </div>

          {/* Journal sections */}
          {DAILY_SECTIONS.map((section) => (
            <JournalSection
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
                  onClick={() => setOverallScore(score)}
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
                {overallScore >= 8 ? '🔥 Excellent day!' :
                 overallScore >= 6 ? '👍 Solid day' :
                 overallScore >= 4 ? '😐 Average day' :
                 '💪 Tomorrow is a new chance'}
              </p>
            )}
          </div>
        </div>
      ) : (
        <WeeklyReviewSection onSaved={() => showNotification('Weekly review saved ✓')} />
      )}
    </div>
    </PageWrapper>
  )
}

function JournalSection({
  section,
  value,
  onChange,
}: {
  section: JournalSection
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="forge-card group">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ backgroundColor: `${section.color}20`, color: section.color }}
        >
          {section.icon}
        </div>
        <span className="text-sm font-semibold">{section.prompt}</span>
        {value.trim() && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
        )}
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

function WeeklyReviewSection({ onSaved }: { onSaved: () => void }) {
  const [entries, setEntries] = useState({
    movedForward: '',
    stalled: '',
    improvements: '',
    nextWeekFocus: '',
  })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSaved()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const sections = [
    { key: 'movedForward', label: '✅ What moved forward?', placeholder: 'Goals, habits, projects that progressed this week...' },
    { key: 'stalled', label: '⚠️ What stalled?', placeholder: 'What got stuck or fell behind? Be honest...' },
    { key: 'improvements', label: '🔧 What to improve?', placeholder: 'Systems, routines, behaviors to change next week...' },
    { key: 'nextWeekFocus', label: '🎯 Next week\'s priority', placeholder: 'The one thing that will make next week a success...' },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Weekly review for the week of {format(new Date(), "'week of' MMM d")}
      </p>
      {sections.map((section) => (
        <div key={section.key} className="forge-card">
          <p className="text-sm font-semibold mb-3">{section.label}</p>
          <textarea
            value={entries[section.key as keyof typeof entries]}
            onChange={(e) => setEntries((prev) => ({ ...prev, [section.key]: e.target.value }))}
            placeholder={section.placeholder}
            rows={4}
            className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground/40 leading-relaxed"
          />
        </div>
      ))}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2" variant={saved ? 'outline' : 'default'}>
          <Save className="w-4 h-4" />
          {saved ? 'Saved ✓' : 'Save weekly review'}
        </Button>
      </div>
    </div>
  )
}
