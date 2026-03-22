export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  )
}
