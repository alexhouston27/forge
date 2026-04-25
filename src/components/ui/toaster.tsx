'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { notification, clearNotification } = useAppStore()

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(clearNotification, 3000)
    return () => clearTimeout(timer)
  }, [notification, clearNotification])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium max-w-sm',
              notification.type === 'success' && 'bg-card border-primary/20 text-foreground',
              notification.type === 'error' && 'bg-destructive text-destructive-foreground border-destructive',
              notification.type === 'info' && 'bg-card border-border text-foreground',
            )}
          >
            <span className="flex-1">{notification.message}</span>
            <button onClick={clearNotification} className="opacity-60 hover:opacity-100 transition-opacity">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
