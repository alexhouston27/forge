'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { GoalWithRelations } from '@/types'

const CATEGORIES = [
  { value: 'HEALTH', label: '💪 Health' },
  { value: 'CAREER', label: '💼 Career' },
  { value: 'LEARNING', label: '📚 Learning' },
  { value: 'FINANCE', label: '💰 Finance' },
  { value: 'RELATIONSHIPS', label: '❤️ Relationships' },
  { value: 'CREATIVITY', label: '🎨 Creativity' },
  { value: 'PERSONAL', label: '⭐ Personal' },
  { value: 'BUSINESS', label: '🚀 Business' },
]

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#10b981',
  '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6',
]

interface GoalFormProps {
  onSubmit: (data: Partial<GoalWithRelations>) => void
  onCancel: () => void
  initialData?: Partial<GoalWithRelations>
}

export function GoalForm({ onSubmit, onCancel, initialData }: GoalFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [category, setCategory] = useState(initialData?.category ?? 'PERSONAL')
  const [color, setColor] = useState(initialData?.color ?? '#6366f1')
  const [emoji, setEmoji] = useState(initialData?.emoji ?? '')
  const [targetDate, setTargetDate] = useState(
    initialData?.targetDate ? new Date(initialData.targetDate).toISOString().split('T')[0] : '',
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      color,
      emoji: emoji || undefined,
      targetDate: targetDate ? new Date(targetDate) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Emoji + Title */}
      <div className="flex gap-2">
        <div>
          <Label className="text-xs">Emoji</Label>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🎯"
            className="mt-1 w-12 h-9 text-center text-lg border border-border rounded-md bg-transparent outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="title" className="text-xs">Goal title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Read 12 books this year"
            className="mt-1"
            required
            autoFocus
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="desc" className="text-xs">Description</Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Why does this matter? What does success look like?"
          className="mt-1 resize-none"
          rows={3}
        />
      </div>

      {/* Category */}
      <div>
        <Label className="text-xs">Category</Label>
        <div className="grid grid-cols-4 gap-1.5 mt-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === cat.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <Label className="text-xs">Color</Label>
        <div className="flex gap-2 mt-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                outline: color === c ? `3px solid ${c}` : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Target date */}
      <div>
        <Label htmlFor="date" className="text-xs">Target date (optional)</Label>
        <Input
          id="date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={!title.trim()}>
          Create goal
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
