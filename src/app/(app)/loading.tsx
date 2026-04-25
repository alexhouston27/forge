export default function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-forge-500 to-purple-600 animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  )
}
