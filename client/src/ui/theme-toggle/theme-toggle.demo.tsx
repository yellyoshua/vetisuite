import ThemeToggle from './theme-toggle'

export default function ThemeToggleDemo() {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <ThemeToggle />
      <span>Alterna la clase .dark en el documento mientras estás en esta página.</span>
    </div>
  )
}
