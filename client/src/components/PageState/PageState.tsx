type PageErrorProps = {
  message: string
}

export function PageLoading() {
  return (
    <output aria-live="polite" className="flex items-center justify-center py-16">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-transparent" />
      <span className="sr-only">Cargando…</span>
    </output>
  )
}

export function PageError({ message }: PageErrorProps) {
  return (
    <div role="alert" className="bg-danger-soft border border-danger/30 rounded-xl p-6">
      <p className="text-danger">Error: {message}</p>
    </div>
  )
}
