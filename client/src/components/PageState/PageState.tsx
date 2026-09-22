type PageErrorProps = {
  message: string
}

export function PageLoading() {
  return (
    <output aria-live="polite" className="flex items-center justify-center py-16">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent dark:border-gray-600 dark:border-t-transparent" />
      <span className="sr-only">Cargando…</span>
    </output>
  )
}

export function PageError({ message }: PageErrorProps) {
  return (
    <div role="alert" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
      <p className="text-red-800 dark:text-red-400">Error: {message}</p>
    </div>
  )
}
