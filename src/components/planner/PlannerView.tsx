'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Clock, Target, Lightbulb, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScheduleTimeline } from '@/components/today/ScheduleTimeline'
import type { AIScheduleResponse, TimeBlockItem } from '@/types'
import { PageWrapper } from '@/components/shared/PageWrapper'
import { useAppStore, useDataStore } from '@/store'

const PROMPT_SUGGESTIONS = [
  "I work 9–5, need to workout and finish a project proposal",
  "Morning person, studying for exams, need focused deep work sessions",
  "Entrepreneur, 3 meetings today, need to write content and exercise",
  "Work from home, two kids, need productivity blocks around school runs",
]

export function PlannerView() {
  const router = useRouter()
  const { setDailyFocus, showNotification } = useAppStore()
  const { tasks } = useDataStore()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<AIScheduleResponse | null>(null)
  const [timeBlocks, setTimeBlocks] = useState<TimeBlockItem[]>([])
  const [applied, setApplied] = useState(false)

  function applyToToday() {
    if (!plan) return
    setDailyFocus(plan.mainFocus)
    showNotification('Plan applied — today\'s focus updated ✓')
    setApplied(true)
    router.push('/today')
  }

  async function generatePlan() {
    if (!prompt.trim() || loading) return
    setLoading(true)

    try {
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          tasks: tasks.filter((t) => t.status !== 'COMPLETED'),
        }),
      })

      if (!response.ok) throw new Error('Failed to generate plan')

      const data = await response.json() as AIScheduleResponse
      setPlan(data)

      // Convert to TimeBlockItem with IDs
      const blocks: TimeBlockItem[] = data.timeBlocks.map((b, i) => ({
        ...b,
        id: `block-${i}`,
        dailyPlanId: 'today',
        isCompleted: false,
      }))
      setTimeBlocks(blocks)
    } catch {
      showNotification('Failed to generate plan — check your OpenAI API key', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
    <div className="max-w-5xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-forge-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AI Planner</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Tell FORGE about your day and get an optimized schedule in seconds.
        </p>
      </div>

      {/* Input area */}
      <div className="forge-card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Describe your day</span>
        </div>

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="I work 4-10pm, need to workout and study for 2 hours. Have a team call at noon..."
          className="resize-none mb-3"
          rows={3}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generatePlan()
          }}
        />

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PROMPT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setPrompt(suggestion)}
              className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors text-left"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            <kbd className="font-mono">⌘↵</kbd> to generate
          </span>
          <Button
            onClick={generatePlan}
            disabled={!prompt.trim() || loading}
            className="gap-2 bg-gradient-to-r from-forge-500 to-purple-600 hover:from-forge-600 hover:to-purple-700 text-white border-0"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
            ) : (
              <><Zap className="w-4 h-4" />Plan My Day</>
            )}
          </Button>
        </div>
      </div>

      {/* Plan output */}
      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* Main focus */}
            <div className="forge-card bg-gradient-to-br from-forge-500/5 to-purple-600/5 border-forge-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Today's Main Focus
                </span>
              </div>
              <p className="text-base font-semibold">{plan.mainFocus}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Timeline */}
              <div className="lg:col-span-3">
                <h2 className="text-sm font-semibold mb-3">Optimized Schedule</h2>
                <div className="forge-card">
                  <ScheduleTimeline timeBlocks={timeBlocks} />
                </div>
              </div>

              {/* Insights sidebar */}
              <div className="lg:col-span-2 space-y-4">
                {/* Priorities */}
                <div className="forge-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Top Priorities
                    </h3>
                  </div>
                  <ol className="space-y-2">
                    {plan.priorities.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {p}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* AI Insights */}
                <div className="forge-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      AI Insights
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {plan.insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Apply to today */}
                <Button
                  className="w-full gap-2"
                  variant={applied ? 'outline' : 'default'}
                  onClick={applyToToday}
                >
                  <Clock className="w-4 h-4" />
                  {applied ? 'Applied ✓' : 'Apply to Today'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!plan && !loading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forge-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Your AI planner is ready</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Describe your constraints, goals, and preferences above. FORGE will generate
            an optimized schedule tailored to your energy and priorities.
          </p>
        </div>
      )}
    </div>
    </PageWrapper>
  )
}
