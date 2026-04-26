'use client'

import { BarChart2, TrendingUp, Flame, Target, CheckCircle2, BookOpen } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { PageWrapper } from '@/components/shared/PageWrapper'
import { useDataStore } from '@/store'
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'

export function AnalyticsView() {
  const { habits, tasks, goals } = useDataStore()

  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length
  const totalTasks = tasks.length
  const activeGoals = goals.filter((g) => g.status === 'ACTIVE').length
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED').length
  const longestStreak = Math.max(...habits.map((h) => h.longestStreak), 0)
  const currentStreak = Math.max(...habits.map((h) => h.currentStreak), 0)
  const totalHabitCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0)

  // Build last 7 weeks of task + habit data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const weekStart = startOfWeek(subDays(new Date(), (6 - i) * 7), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    const interval = { start: weekStart, end: weekEnd }

    const tasksCompleted = tasks.filter((t) => {
      if (!t.completedAt) return false
      return isWithinInterval(new Date(t.completedAt), interval)
    }).length

    const habitsCompleted = habits.reduce((sum, h) => {
      const count = (h.completedDates ?? []).filter((d) => {
        try { return isWithinInterval(new Date(d), interval) } catch { return false }
      }).length
      return sum + count
    }, 0)

    return {
      week: format(weekStart, 'MMM d'),
      tasksCompleted,
      habitsCompleted,
    }
  })

  const hasAnyData = totalTasks > 0 || habits.length > 0 || goals.length > 0
  const weeklyHasData = weeklyData.some((w) => w.tasksCompleted > 0 || w.habitsCompleted > 0)

  const stats = [
    { icon: <CheckCircle2 className="w-5 h-5 text-primary" />, label: 'Tasks completed', value: completedTasks.toString(), sub: `of ${totalTasks} total` },
    { icon: <Flame className="w-5 h-5 text-orange-500" />, label: 'Habit streak', value: currentStreak > 0 ? `${currentStreak}d` : '—', sub: `best: ${longestStreak}d` },
    { icon: <Target className="w-5 h-5 text-emerald-500" />, label: 'Goals active', value: activeGoals.toString(), sub: `${completedGoals} completed` },
    { icon: <BookOpen className="w-5 h-5 text-purple-500" />, label: 'Habit check-ins', value: totalHabitCompletions.toString(), sub: 'all time' },
  ]

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-primary" />
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Your life momentum at a glance.</p>
        </div>

        {!hasAnyData ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No data yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Start adding habits, tasks, and goals. Your analytics will appear here as you build momentum.
            </p>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, i) => (
                <div key={i} className="forge-card">
                  <div className="flex items-center justify-between mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs font-medium">{stat.label}</div>
                  <div className="text-[11px] text-muted-foreground">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Weekly bar chart */}
            <div className="forge-card mb-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm">Tasks & Habits — Weekly</h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary" /> Tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-orange-500" /> Habits
                  </span>
                </div>
              </div>
              {weeklyHasData ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={weeklyData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="tasksCompleted" name="Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="habitsCompleted" name="Habits" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">
                  Complete some tasks and habits to see your weekly trend.
                </div>
              )}
            </div>

            {/* Goals progress */}
            {goals.length > 0 && (
              <div className="forge-card">
                <h2 className="font-semibold text-sm mb-4">Goals Progress</h2>
                <div className="space-y-3">
                  {goals.filter((g) => g.status === 'ACTIVE').map((goal) => (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium flex items-center gap-1.5">
                          {goal.emoji && <span>{goal.emoji}</span>}
                          {goal.title}
                        </span>
                        <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  )
}
