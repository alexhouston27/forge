'use client'

import { BarChart2, TrendingUp, Flame, Target, CheckCircle2, BookOpen, Zap } from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { DEMO_WEEKLY_DATA, DEMO_RADAR_DATA } from '@/lib/demo-data'
import { PageWrapper } from '@/components/shared/PageWrapper'

const STATS = [
  { icon: <CheckCircle2 className="w-5 h-5 text-primary" />, label: 'Tasks completed', value: '47', sub: 'this month', trend: '+12%' },
  { icon: <Flame className="w-5 h-5 text-orange-500" />, label: 'Habit streak', value: '12d', sub: 'current', trend: 'best: 21d' },
  { icon: <Target className="w-5 h-5 text-emerald-500" />, label: 'Goals active', value: '5', sub: '2 completed', trend: '+1 this month' },
  { icon: <BookOpen className="w-5 h-5 text-purple-500" />, label: 'Journal streak', value: '8d', sub: 'consecutive', trend: 'personal best' },
]

export function AnalyticsView() {
  return (
    <PageWrapper>
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-primary" />
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your life momentum at a glance.
        </p>
      </div>

      {/* Life momentum hero */}
      <div className="forge-card mb-6 bg-gradient-to-br from-forge-500/5 to-purple-600/5 border-forge-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-semibold">Life Momentum Score</span>
          </div>
          <span className="text-xs text-muted-foreground">Last 30 days</span>
        </div>
        <div className="flex items-end gap-6">
          <div>
            <div className="text-5xl font-black forge-gradient-text">82</div>
            <div className="text-sm text-muted-foreground mt-1">out of 100</div>
          </div>
          <div className="flex-1 pb-1">
            <ProgressBar value={82} color="#6366f1" size="lg" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Building momentum 🔥</span>
              <span>+8 pts vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat, i) => (
          <div key={i} className="forge-card">
            <div className="flex items-center justify-between mb-2">
              {stat.icon}
              <span className="text-[10px] text-emerald-500 font-medium">{stat.trend}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs font-medium">{stat.label}</div>
            <div className="text-[11px] text-muted-foreground">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Weekly score trend */}
        <div className="lg:col-span-2 forge-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Weekly Score</h2>
            <span className="text-xs text-muted-foreground">Last 8 weeks</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DEMO_WEEKLY_DATA}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#scoreGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Life radar */}
        <div className="forge-card">
          <h2 className="font-semibold text-sm mb-4">Life Balance</h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={DEMO_RADAR_DATA}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="area"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Radar
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task + habit completion bar chart */}
      <div className="forge-card mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Tasks & Habits — Weekly</h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
              Tasks
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
              Habits
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={DEMO_WEEKLY_DATA} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="tasksCompleted" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="habitsCompleted" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* XP / Gamification */}
      <div className="forge-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black text-sm">
              12
            </div>
            <div>
              <p className="text-sm font-bold">Level 12 — Forge Master</p>
              <p className="text-xs text-muted-foreground">2,840 XP total</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">360 XP to Level 13</span>
        </div>
        <ProgressBar value={89} color="#f59e0b" size="md" />
        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Task Master', emoji: '✅', earned: true },
            { label: 'Habit Streak', emoji: '🔥', earned: true },
            { label: 'Deep Thinker', emoji: '📔', earned: true },
            { label: 'Goal Crusher', emoji: '🎯', earned: false },
          ].map((badge) => (
            <div
              key={badge.label}
              className={`p-2 rounded-xl text-center ${
                badge.earned ? 'bg-muted' : 'bg-muted/30 opacity-50 grayscale'
              }`}
            >
              <div className="text-2xl mb-1">{badge.emoji}</div>
              <p className="text-[10px] font-medium">{badge.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </PageWrapper>
  )
}
