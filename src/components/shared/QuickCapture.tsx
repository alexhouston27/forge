'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap } from 'lucide-react'
import { useAppStore, useDataStore } from '@/store'
import { Button } from '@/components/ui/button'
import { cn, generateId } from '@/lib/utils'
import type { TaskItem, NoteItem } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { addTask as addFirestoreTask, addNote as addFirestoreNote } from '@/lib/firestore-data'

const TYPES = [
  { key: 'task', label: 'Task', placeholder: 'What needs to get done?' },
  { key: 'note', label: 'Note', placeholder: 'What\'s on your mind?' },
  { key: 'idea', label: 'Idea', placeholder: 'Capture your idea...' },
] as const

export function QuickCapture() {
  const { quickCaptureOpen, quickCaptureType, closeQuickCapture, showNotification } = useAppStore()
  const { addTask, addNote } = useDataStore()
  const { user } = useAuth()
  const [type, setType] = useState<'task' | 'note' | 'idea'>(quickCaptureType)
  const [value, setValue] = useState('')

  useEffect(() => {
    if (quickCaptureOpen) {
      setType(quickCaptureType)
      setValue('')
    }
  }, [quickCaptureOpen, quickCaptureType])

  const placeholder = TYPES.find((t) => t.key === type)?.placeholder ?? ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    const text = value.trim()
    setValue('')
    closeQuickCapture()

    if (type === 'task') {
      if (user) {
        await addFirestoreTask(user.uid, { title: text, priority: 'MEDIUM' })
      } else {
        addTask({ id: generateId(), title: text, status: 'TODO', priority: 'MEDIUM', tags: [] } as TaskItem)
      }
      showNotification('Task added')
    } else {
      if (user) {
        await addFirestoreNote(user.uid, { title: text.slice(0, 60), content: text, type: type === 'idea' ? 'IDEA' : 'NOTE' })
      } else {
        addNote({ id: generateId(), title: text.slice(0, 60), content: text, type: type === 'idea' ? 'IDEA' : 'NOTE', tags: [], isPinned: false, isFavorite: false, createdAt: new Date(), updatedAt: new Date() } as NoteItem)
      }
      showNotification(type === 'idea' ? 'Idea saved to Vault' : 'Note saved')
    }
  }

  return (
    <AnimatePresence>
      {quickCaptureOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={closeQuickCapture}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-forge-500 to-purple-600 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-semibold">Quick Capture</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Type selector */}
                  <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
                    {TYPES.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setType(t.key)}
                        className={cn(
                          'px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150',
                          type === t.key
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <Button variant="ghost" size="icon" className="w-6 h-6" onClick={closeQuickCapture}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4">
                <textarea
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                    if (e.key === 'Escape') closeQuickCapture()
                  }}
                />
                <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
                  <span className="text-[11px] text-muted-foreground">
                    <kbd className="font-mono">↵</kbd> to save · <kbd className="font-mono">Shift+↵</kbd> new line
                  </span>
                  <Button type="submit" size="sm" className="h-7 text-xs" disabled={!value.trim()}>
                    Save
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
