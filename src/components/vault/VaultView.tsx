'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Search, Plus, Pin, Tag } from 'lucide-react'
import type { NoteItem } from '@/types'
import { NoteCard } from './NoteCard'
import { NoteEditor } from './NoteEditor'
import { PageWrapper } from '@/components/shared/PageWrapper'
import { Button } from '@/components/ui/button'
import { DEMO_NOTES } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

const NOTE_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'NOTE', label: '📝 Notes' },
  { key: 'IDEA', label: '💡 Ideas' },
  { key: 'BUSINESS', label: '🚀 Business' },
  { key: 'QUOTE', label: '💬 Quotes' },
  { key: 'RESOURCE', label: '🔗 Resources' },
]

export function VaultView() {
  const [notes, setNotes] = useState<NoteItem[]>(DEMO_NOTES)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null)
  const [creating, setCreating] = useState(false)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        !search ||
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === 'all' || note.type === typeFilter
      const matchesTag = !activeTag || note.tags.includes(activeTag)
      return matchesSearch && matchesType && matchesTag
    })
  }, [notes, search, typeFilter, activeTag])

  const pinned = filtered.filter((n) => n.isPinned)
  const unpinned = filtered.filter((n) => !n.isPinned)

  const tags = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet)
  }, [notes])

  function handleSave(data: Partial<NoteItem>) {
    if (selectedNote) {
      setNotes((prev) =>
        prev.map((n) => (n.id === selectedNote.id ? { ...n, ...data, updatedAt: new Date() } : n)),
      )
    } else {
      const newNote: NoteItem = {
        id: Math.random().toString(36).slice(2),
        title: data.title ?? 'Untitled',
        content: data.content ?? '',
        type: data.type ?? 'NOTE',
        tags: data.tags ?? [],
        isPinned: false,
        isFavorite: false,
        color: data.color,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setNotes((prev) => [newNote, ...prev])
    }
    setSelectedNote(null)
    setCreating(false)
  }

  function togglePin(id: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)))
  }

  function toggleFavorite(id: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n)))
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    if (selectedNote?.id === id) setSelectedNote(null)
  }

  const showEditor = creating || selectedNote !== null

  return (
    <PageWrapper>
    <div className="flex h-full">
      {/* Left: list */}
      <div className={cn('flex flex-col', showEditor ? 'w-80 shrink-0' : 'flex-1')}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Vault
            </h1>
            <Button
              size="sm"
              className="gap-1.5 h-7 text-xs"
              onClick={() => { setSelectedNote(null); setCreating(true) }}
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes, ideas..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
          </div>

          {/* Type filter */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
            {NOTE_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTypeFilter(t.key)}
                className={cn(
                  'shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                  typeFilter === t.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={cn(
                    'shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all',
                    activeTag === tag
                      ? 'bg-yellow-500/20 text-yellow-600'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  )}
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Pinned */}
          {pinned.length > 0 && (
            <>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1">
                <Pin className="w-2.5 h-2.5" />
                Pinned
              </p>
              {pinned.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={selectedNote?.id === note.id}
                  onSelect={() => { setSelectedNote(note); setCreating(false) }}
                  onPin={togglePin}
                  onFavorite={toggleFavorite}
                  onDelete={deleteNote}
                />
              ))}
              {unpinned.length > 0 && (
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1 pt-2">
                  Notes
                </p>
              )}
            </>
          )}

          {/* All other notes */}
          {unpinned.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isSelected={selectedNote?.id === note.id}
              onSelect={() => { setSelectedNote(note); setCreating(false) }}
              onPin={togglePin}
              onFavorite={toggleFavorite}
              onDelete={deleteNote}
            />
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No notes found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: editor */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 border-l border-border"
          >
            <NoteEditor
              note={selectedNote ?? undefined}
              onSave={handleSave}
              onClose={() => { setSelectedNote(null); setCreating(false) }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PageWrapper>
  )
}
