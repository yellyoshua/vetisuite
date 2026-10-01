import { useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type SegmentedControlOption = { value: string; label: string; icon?: ReactNode }

export type SegmentedControlProps = Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange' | 'aria-label'> & {
  'aria-label': string
  options: SegmentedControlOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
}

const moves: Record<string, (index: number, count: number) => number> = {
  ArrowRight: (index, count) => (index + 1) % count,
  ArrowDown: (index, count) => (index + 1) % count,
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  ArrowUp: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_, count) => count - 1,
}

export default function useSegmentedControl({ options, value, defaultValue, onValueChange, name, className, ...rest }: SegmentedControlProps) {
  const [innerValue, setInnerValue] = useState(defaultValue ?? options[0]?.value ?? '')
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([])
  const selected = value ?? innerValue
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === selected),
    0,
  )

  const select = (next: string) => {
    if (value === undefined) setInnerValue(next)
    if (next !== selected) onValueChange?.(next)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const move = moves[event.key]
    if (!move || options.length === 0) return
    event.preventDefault()
    const next = move(selectedIndex, options.length)
    select(options[next].value)
    buttonsRef.current[next]?.focus()
  }

  return {
    groupProps: { ...rest, role: 'radiogroup', className: cn('flex gap-2', className) },
    hiddenProps: name ? { type: 'hidden', name, value: selected } : null,
    items: options.map((option, index) => {
      const checked = index === selectedIndex
      return {
        key: option.value,
        label: option.label,
        icon: option.icon,
        props: {
          ref: (node: HTMLButtonElement | null) => {
            buttonsRef.current[index] = node
          },
          type: 'button' as const,
          role: 'radio',
          'aria-checked': checked,
          tabIndex: checked ? 0 : -1,
          onClick: () => select(option.value),
          onKeyDown,
          className: cn(
            'inline-flex h-7 flex-1 cursor-pointer touch-manipulation items-center justify-center gap-1.5 rounded-control border px-2.5 text-xs leading-none font-medium whitespace-nowrap transition-[color,background-color,border-color] duration-150 ease-out-expo motion-reduce:transition-none [&_svg]:size-3.5 [&_svg]:shrink-0',
            checked
              ? 'border-transparent bg-primary text-primary-foreground'
              : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground',
          ),
        },
      }
    }),
  }
}
