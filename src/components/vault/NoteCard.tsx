'use client'

import { format } from 'date-fns'
import { Pin, Star, MoreHorizontal, Trash2 } from 'lucide-react'
import type { NoteItem } from '@/types'
import { cn, truncate } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const TYPE_COLORS: Record<string, string> = {
  NOTE: '#6366f1',
  IDEA: '#f59e0b',
  BUSINESS: '#10b981',
  QUOTE: '#ec4899',
  RESOURCE: '#3b82f6',
}

interface NoteCardProps {
  note: NoteItem
  isSelected: boolean
  onSelect: () => void
  onPin: (id: string) => void
  onFavorite: (id: string) => void
  onDelete: (id: string) => void
}

export function NoteCard({ note, isSelected, onSelect, onPin, onFavorite, onDelete }: NoteCardProps) {
  const color = TYPE_COLORS[note.type] ?? '#94a3b8'

  return (
    <div
      onClick={onSelect}
      className={cn(
        'relative px-3 py-2.5 rounded-xl border cursor-pointer group transition-all duration-150',
        isSelected
          ? 'border-primary/50 bg-primary/5'
          : 'border-border hover:border-primary/20 hover:bg-muted/30',
      )}
    >
      {/* Type accent */}
      <div
        className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{note.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
            {truncate(note.content, 100)}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <button className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center shrink-0">
              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onPin(note.id)}>
              <Pin className="w-3.5 h-3.5 mr-2" />
              {note.isPinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFavorite(note.id)}>
              <Star className="w-3.5 h-3.5 mr-2" />
              {note.isFavorite ? 'Unfavorite' : 'Favorite'}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(note.id)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-2">
        <span
          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {note.type}
        </span>
        {note.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            #{tag}
          </span>
        ))}
        <span className="ml-auto text-[9px] text-muted-foreground">
          {format(new Date(note.updatedAt), 'MMM d')}
        </span>
        {note.isPinned && <Pin className="w-2.5 h-2.5 text-muted-foreground" />}
        {note.isFavorite && <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />}
      </div>
    </div>
  )
}
