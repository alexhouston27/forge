'use client'

import { useState, useEffect } from 'react'
import { X, Tag, Save } from 'lucide-react'
import type { NoteItem } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NOTE_TYPES = [
  { value: 'NOTE', label: '📝 Note' },
  { value: 'IDEA', label: '💡 Idea' },
  { value: 'BUSINESS', label: '🚀 Business' },
  { value: 'QUOTE', label: '💬 Quote' },
  { value: 'RESOURCE', label: '🔗 Resource' },
]

interface NoteEditorProps {
  note?: NoteItem
  onSave: (data: Partial<NoteItem>) => void
  onClose: () => void
}

export function NoteEditor({ note, onSave, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [type, setType] = useState(note?.type ?? 'NOTE')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(note?.tags ?? [])
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setTitle(note?.title ?? '')
    setContent(note?.content ?? '')
    setType(note?.type ?? 'NOTE')
    setTags(note?.tags ?? [])
    setDirty(false)
  }, [note?.id])

  function markDirty() { setDirty(true) }

  function addTag() {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag])
      setDirty(true)
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
    setDirty(true)
  }

  function handleSave() {
    onSave({ title, content, type, tags })
    setDirty(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex gap-1">
          {NOTE_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => { setType(t.value); markDirty() }}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                type === t.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {dirty && (
            <Button size="sm" className="h-7 text-xs gap-1.5" onClick={handleSave}>
              <Save className="w-3 h-3" />
              Save
            </Button>
          )}
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden px-8 py-6">
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); markDirty() }}
          placeholder="Title..."
          className="text-2xl font-bold bg-transparent outline-none placeholder:text-muted-foreground/30 mb-4 w-full"
        />

        <textarea
          value={content}
          onChange={(e) => { setContent(e.target.value); markDirty() }}
          placeholder="Start writing..."
          className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed placeholder:text-muted-foreground/40"
        />
      </div>

      {/* Tags footer */}
      <div className="px-8 py-4 border-t border-border">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => removeTag(tag)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              #{tag}
              <X className="w-2.5 h-2.5" />
            </button>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
            }}
            placeholder="Add tag..."
            className="text-xs bg-transparent outline-none text-muted-foreground placeholder:text-muted-foreground/40 w-20"
          />
        </div>
      </div>
    </div>
  )
}
