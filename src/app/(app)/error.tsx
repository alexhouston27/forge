'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[FORGE error boundary]', error)
  }, [error])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold mb-1">Something went wrong</h3>
          <p className="text-sm text-muted-foreground">{error.message || 'An unexpected error occurred.'}</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  )
}
