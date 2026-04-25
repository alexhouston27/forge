'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Palette, Bell, Zap, Shield, LogOut, Trash2,
  Check, ChevronRight, Download, Sun, Moon, Monitor,
  Clock, Battery, Calendar, AlertTriangle, Save,
} from 'lucide-react'
import { useAppStore } from '@/store'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { DEMO_GOALS, DEMO_HABITS, DEMO_TASKS, DEMO_NOTES } from '@/lib/demo-data'

// ─── Nav ──────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'appearance',   label: 'Appearance',     icon: Palette },
  { id: 'notifications',label: 'Notifications',  icon: Bell },
  { id: 'ai',           label: 'AI & Planner',   icon: Zap },
  { id: 'data',         label: 'Data & Privacy', icon: Shield },
] as const

type SectionId = typeof SECTIONS[number]['id']

// ─── Reusable primitives ──────────────────────────────────────────────────────

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('card-base p-6', className)}>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold mb-4">{children}</h2>
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3.5 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex w-10 h-5.5 items-center rounded-full transition-colors duration-200 focus:outline-none',
        checked ? 'bg-primary' : 'bg-muted-foreground/25',
      )}
      style={{ height: '22px', width: '40px' }}
    >
      <motion.span
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        className="inline-block w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  )
}

// ─── Profile section ──────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#10b981',
  '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6',
]

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata',
  'Australia/Sydney', 'Pacific/Auckland',
]

function ProfileSection() {
  const { profile, updateProfile, showNotification } = useAppStore()
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [bio, setBio] = useState(profile.bio)
  const [timezone, setTimezone] = useState(profile.timezone)
  const [dirty, setDirty] = useState(false)

  function mark() { setDirty(true) }

  function save() {
    updateProfile({ name: name.trim() || profile.name, email, bio, timezone })
    setDirty(false)
    showNotification('Profile saved')
  }

  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionTitle>Personal information</SectionTitle>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0"
            style={{ backgroundColor: profile.avatarColor }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Avatar color</p>
            <div className="flex gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => { updateProfile({ avatarColor: color }); setDirty(true) }}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 relative"
                  style={{ backgroundColor: color }}
                >
                  {profile.avatarColor === color && (
                    <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-xs font-medium">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => { setName(e.target.value); mark() }}
                className="mt-1.5"
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); mark() }}
                className="mt-1.5"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio" className="text-xs font-medium">Bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => { setBio(e.target.value); mark() }}
              placeholder="A short bio about yourself and your goals..."
              rows={3}
              maxLength={280}
              className="mt-1.5 w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground/50 leading-relaxed"
            />
            <p className="text-[11px] text-muted-foreground mt-1 text-right">{bio.length}/280</p>
          </div>

          <div>
            <Label htmlFor="timezone" className="text-xs font-medium">Timezone</Label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => { setTimezone(e.target.value); mark() }}
              className="mt-1.5 w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center justify-between p-4 card-base border-primary/20 bg-primary/4"
          >
            <p className="text-sm text-muted-foreground">You have unsaved changes.</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setName(profile.name); setEmail(profile.email); setBio(profile.bio); setTimezone(profile.timezone); setDirty(false) }}
              >
                Discard
              </Button>
              <Button size="sm" className="gap-1.5" onClick={save}>
                <Save className="w-3.5 h-3.5" />
                Save changes
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats card */}
      <SectionCard>
        <SectionTitle>Account stats</SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Member since', value: 'Apr 2025' },
            { label: 'Goals created', value: DEMO_GOALS.length.toString() },
            { label: 'Habits tracked', value: DEMO_HABITS.length.toString() },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/40">
              <p className="text-lg font-black tabular-nums">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Appearance section ───────────────────────────────────────────────────────

function AppearanceSection() {
  const { preferences, updatePreferences, showNotification, sidebarCollapsed, toggleSidebar } = useAppStore()

  function setTheme(theme: 'light' | 'dark' | 'system') {
    updatePreferences({ theme })
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      prefersDark ? root.classList.add('dark') : root.classList.remove('dark')
    }
    showNotification(`Theme set to ${theme}`)
  }

  const THEME_OPTIONS = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark',  label: 'Dark',  icon: Moon },
    { value: 'system',label: 'System',icon: Monitor },
  ] as const

  const ACCENT_COLORS = [
    { label: 'Violet', value: '#6366f1' },
    { label: 'Purple', value: '#8b5cf6' },
    { label: 'Rose',   value: '#f43f5e' },
    { label: 'Emerald',value: '#10b981' },
    { label: 'Amber',  value: '#f59e0b' },
    { label: 'Sky',    value: '#0ea5e9' },
  ]

  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionTitle>Theme</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const active = preferences.theme === value
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex flex-col items-center gap-2.5 py-4 rounded-xl border transition-all duration-150',
                  active
                    ? 'border-primary bg-primary/6 text-primary'
                    : 'border-border hover:border-muted-foreground/40 text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Accent color</SectionTitle>
        <div className="flex gap-3 flex-wrap">
          {ACCENT_COLORS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => updatePreferences({ accentColor: value })}
              title={label}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className="w-8 h-8 rounded-full transition-transform hover:scale-110 relative"
                style={{ backgroundColor: value }}
              >
                {preferences.accentColor === value && (
                  <Check className="w-4 h-4 text-white absolute inset-0 m-auto" strokeWidth={3} />
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          Accent color applies to active states and highlights. Takes full effect after re-connecting a Supabase account.
        </p>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Layout</SectionTitle>
        <FieldRow
          label="Sidebar collapsed by default"
          hint="Start each session with the sidebar collapsed for more content space."
        >
          <Toggle
            checked={sidebarCollapsed}
            onChange={() => toggleSidebar()}
          />
        </FieldRow>
      </SectionCard>
    </div>
  )
}

// ─── Notifications section ────────────────────────────────────────────────────

function NotificationsSection() {
  const { preferences, updateNotificationPreferences } = useAppStore()
  const n = preferences.notifications

  const items = [
    {
      key: 'habitReminders' as const,
      label: 'Habit reminders',
      hint: 'Daily nudges when you have unfinished habits.',
    },
    {
      key: 'weeklyReview' as const,
      label: 'Weekly review prompt',
      hint: 'Sunday evening reminder to complete your weekly reflection.',
    },
    {
      key: 'aiInsights' as const,
      label: 'AI insights',
      hint: 'Get personalized suggestions based on your patterns.',
    },
    {
      key: 'goalDeadlines' as const,
      label: 'Goal deadline alerts',
      hint: 'Notified 7 days and 1 day before a goal target date.',
    },
    {
      key: 'dailyDigest' as const,
      label: 'Daily digest email',
      hint: 'Morning summary of today\'s tasks, habits, and focus.',
    },
  ]

  return (
    <SectionCard>
      <SectionTitle>Notification preferences</SectionTitle>
      <div>
        {items.map((item) => (
          <FieldRow key={item.key} label={item.label} hint={item.hint}>
            <Toggle
              checked={n[item.key]}
              onChange={(v) => updateNotificationPreferences({ [item.key]: v })}
            />
          </FieldRow>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── AI & Planner section ─────────────────────────────────────────────────────

function AIPlannerSection() {
  const { preferences, updatePreferences, showNotification } = useAppStore()
  const [start, setStart] = useState(preferences.workHoursStart)
  const [end, setEnd] = useState(preferences.workHoursEnd)

  function saveWorkHours() {
    updatePreferences({ workHoursStart: start, workHoursEnd: end })
    showNotification('Work hours saved')
  }

  const ENERGY_OPTIONS = [
    { value: 'morning',   label: 'Morning',   emoji: '🌅', hint: 'Best before noon' },
    { value: 'afternoon', label: 'Afternoon', emoji: '☀️', hint: 'Best 12–5pm' },
    { value: 'evening',   label: 'Evening',   emoji: '🌙', hint: 'Best after 5pm' },
  ] as const

  const WEEK_OPTIONS = [
    { value: 'monday', label: 'Monday' },
    { value: 'sunday', label: 'Sunday' },
  ] as const

  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionTitle>Work hours</SectionTitle>
        <p className="text-xs text-muted-foreground mb-4">
          The AI planner uses these as defaults when scheduling your day.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label className="text-xs font-medium">Start time</Label>
            <Input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs font-medium">End time</Label>
            <Input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div className="pt-5">
            <Button size="sm" onClick={saveWorkHours} variant="outline">
              Save
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Peak energy time</SectionTitle>
        <p className="text-xs text-muted-foreground mb-4">
          FORGE schedules your most demanding tasks during your peak energy window.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {ENERGY_OPTIONS.map(({ value, label, emoji, hint }) => {
            const active = preferences.energyPeak === value
            return (
              <button
                key={value}
                onClick={() => { updatePreferences({ energyPeak: value }); showNotification(`Energy peak set to ${label}`) }}
                className={cn(
                  'flex flex-col items-center gap-1.5 py-4 rounded-xl border transition-all duration-150 text-center',
                  active
                    ? 'border-primary bg-primary/6'
                    : 'border-border hover:border-muted-foreground/40',
                )}
              >
                <span className="text-2xl">{emoji}</span>
                <span className={cn('text-xs font-semibold', active ? 'text-primary' : 'text-foreground')}>{label}</span>
                <span className="text-[10px] text-muted-foreground">{hint}</span>
              </button>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Calendar</SectionTitle>
        <FieldRow label="Week starts on" hint="Affects your weekly review and planning views.">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {WEEK_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updatePreferences({ weekStartsOn: value })}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  preferences.weekStartsOn === value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </FieldRow>
      </SectionCard>
    </div>
  )
}

// ─── Data & Privacy section ───────────────────────────────────────────────────

function DataPrivacySection() {
  const { showNotification } = useAppStore()
  const { signOut: firebaseSignOut } = useAuth()
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  function exportData() {
    const data = {
      exportedAt: new Date().toISOString(),
      goals: DEMO_GOALS,
      habits: DEMO_HABITS,
      tasks: DEMO_TASKS,
      notes: DEMO_NOTES,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `forge-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showNotification('Data exported successfully')
  }

  async function signOut() {
    await firebaseSignOut()
    router.replace('/login')
  }

  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionTitle>Your data</SectionTitle>
        <FieldRow
          label="Export all data"
          hint="Download a complete copy of your goals, habits, tasks, and notes as JSON."
        >
          <Button variant="outline" size="sm" className="gap-2" onClick={exportData}>
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        </FieldRow>
        <FieldRow
          label="Data storage"
          hint="Your data is stored locally in this browser until you connect a Supabase account."
        >
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md font-medium">
            Local
          </span>
        </FieldRow>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Account</SectionTitle>
        <FieldRow
          label="Sign out"
          hint="You will be redirected to the login page."
        >
          <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive hover:border-destructive/50" onClick={signOut}>
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </Button>
        </FieldRow>
      </SectionCard>

      <SectionCard className="border-destructive/30">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <SectionTitle>Danger zone</SectionTitle>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          These actions are permanent and cannot be undone.
        </p>

        {!confirmDelete ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete account
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-destructive">
              Type <span className="font-mono bg-destructive/10 px-1 rounded">DELETE</span> to confirm
            </p>
            <Input
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              className="border-destructive/40 focus:ring-destructive/30 font-mono"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={deleteInput !== 'DELETE'}
                className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => showNotification('Account deletion requires a connected backend', 'error')}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete permanently
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setConfirmDelete(false); setDeleteInput('') }}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>('profile')
  const { profile } = useAppStore()

  const CONTENT: Record<SectionId, React.ReactNode> = {
    profile:       <ProfileSection />,
    appearance:    <AppearanceSection />,
    notifications: <NotificationsSection />,
    ai:            <AIPlannerSection />,
    data:          <DataPrivacySection />,
  }

  const SECTION_LABELS: Record<SectionId, string> = {
    profile: 'Profile',
    appearance: 'Appearance',
    notifications: 'Notifications',
    ai: 'AI & Planner',
    data: 'Data & Privacy',
  }

  const initials = profile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="max-w-[900px] mx-auto px-5 py-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-[26px] font-black tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your profile, preferences, and account.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <nav className="w-48 shrink-0 space-y-0.5">
          {/* Profile pill */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
              style={{ backgroundColor: profile.avatarColor }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{profile.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{profile.email}</p>
            </div>
          </div>

          <div className="h-px bg-border mb-2" />

          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-100 text-left',
                active === id
                  ? 'bg-primary/8 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active === id ? 'text-primary' : '')} />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <h2 className="text-base font-semibold">{SECTION_LABELS[active]}</h2>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {CONTENT[active]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
