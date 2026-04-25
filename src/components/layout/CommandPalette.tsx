'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun, Target, Flame, Calendar, Lightbulb, BookOpen, BarChart2,
  Plus, Search, Zap, Focus, RefreshCw, Star,
} from 'lucide-react'
import { useAppStore } from '@/store'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PAGES = [
  { title: 'Today', href: '/today', icon: Sun, description: 'Your daily command center' },
  { title: 'Goals', href: '/goals', icon: Target, description: 'Long-term goals & milestones' },
  { title: 'Habits', href: '/habits', icon: Flame, description: 'Daily habit tracking' },
  { title: 'Planner', href: '/planner', icon: Calendar, description: 'AI-powered day planner' },
  { title: 'Vault', href: '/vault', icon: Lightbulb, description: 'Ideas & second brain' },
  { title: 'Journal', href: '/journal', icon: BookOpen, description: 'Daily reflection' },
  { title: 'Analytics', href: '/analytics', icon: BarChart2, description: 'Life momentum stats' },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const { openQuickCapture, toggleFocusMode } = useAppStore()

  const runCommand = useCallback(
    (fn: () => void) => {
      onOpenChange(false)
      fn()
    },
    [onOpenChange],
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-[20%] -translate-x-1/2 z-50 w-full max-w-lg"
          >
            <Command
              className="rounded-2xl border border-border shadow-2xl bg-card overflow-hidden"
              shouldFilter={true}
            >
              <div className="flex items-center border-b border-border px-4">
                <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
                <Command.Input
                  placeholder="Search or run a command..."
                  className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
                <kbd className="ml-2 text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>

                {/* Navigation */}
                <Command.Group heading="Navigate" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
                  {PAGES.map((page) => (
                    <Command.Item
                      key={page.href}
                      value={`navigate ${page.title} ${page.description}`}
                      onSelect={() => runCommand(() => router.push(page.href))}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm aria-selected:bg-accent transition-colors"
                    >
                      <page.icon className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{page.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{page.description}</div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>

                {/* Actions */}
                <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
                  <Command.Item
                    value="capture task new quick add"
                    onSelect={() => runCommand(() => openQuickCapture('task'))}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm aria-selected:bg-accent transition-colors"
                  >
                    <Plus className="w-4 h-4 text-muted-foreground" />
                    <span>New Task</span>
                    <kbd className="ml-auto text-[10px] font-mono text-muted-foreground">⌘T</kbd>
                  </Command.Item>
                  <Command.Item
                    value="capture idea note new"
                    onSelect={() => runCommand(() => openQuickCapture('idea'))}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm aria-selected:bg-accent transition-colors"
                  >
                    <Lightbulb className="w-4 h-4 text-muted-foreground" />
                    <span>New Idea</span>
                    <kbd className="ml-auto text-[10px] font-mono text-muted-foreground">⌘I</kbd>
                  </Command.Item>
                  <Command.Item
                    value="focus mode toggle"
                    onSelect={() => runCommand(toggleFocusMode)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm aria-selected:bg-accent transition-colors"
                  >
                    <Focus className="w-4 h-4 text-muted-foreground" />
                    <span>Toggle Focus Mode</span>
                    <kbd className="ml-auto text-[10px] font-mono text-muted-foreground">⌘F</kbd>
                  </Command.Item>
                  <Command.Item
                    value="plan ai generate day planner"
                    onSelect={() => runCommand(() => router.push('/planner'))}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm aria-selected:bg-accent transition-colors"
                  >
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-primary font-medium">Plan My Day with AI</span>
                  </Command.Item>
                  <Command.Item
                    value="reset week workflow"
                    onSelect={() => runCommand(() => router.push('/analytics?reset=week'))}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm aria-selected:bg-accent transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    <span>Reset My Week</span>
                  </Command.Item>
                  <Command.Item
                    value="journal today daily review"
                    onSelect={() => runCommand(() => router.push('/journal'))}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm aria-selected:bg-accent transition-colors"
                  >
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <span>Write Today's Reflection</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
                <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                <span><kbd className="font-mono">↵</kbd> select</span>
                <span><kbd className="font-mono">ESC</kbd> close</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
