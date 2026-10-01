import { useEffect, useState, type ComponentProps, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

export type ThemeToggleProps = Omit<ComponentProps<'button'>, 'children'>

const darkClass = 'dark'

function readIsDark() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains(darkClass)
}

export default function useThemeToggle({ onClick, className, ...rest }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(readIsDark)

  useEffect(() => () => document.documentElement.classList.remove(darkClass), [])

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    const next = !isDark
    document.documentElement.classList.toggle(darkClass, next)
    setIsDark(next)
  }

  return {
    isDark,
    buttonProps: {
      ...rest,
      type: 'button' as const,
      'aria-pressed': isDark,
      'aria-label': rest['aria-label'] ?? 'Modo oscuro',
      onClick: handleClick,
      className: cn(
        'inline-flex size-8 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-control border border-border bg-card text-muted-foreground transition-[color,border-color] duration-150 ease-out-expo hover:border-muted-foreground/40 hover:text-foreground motion-reduce:transition-none [&_svg]:size-4',
        className,
      ),
    },
  }
}
