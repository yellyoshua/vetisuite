import { useId, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type TabsItem = {
  value: string
  label: ReactNode
  content: ReactNode
  disabled?: boolean
}

export type TabsProps = Omit<ComponentProps<'div'>, 'defaultValue'> & {
  items: TabsItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  'aria-label'?: string
}

export default function useTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
  'aria-label': ariaLabel,
  ...rest
}: TabsProps) {
  const baseId = useId()
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const enabled = items.filter((item) => !item.disabled)
  const [innerValue, setInnerValue] = useState(defaultValue ?? enabled[0]?.value ?? '')
  const current = value ?? innerValue

  const select = (next: string) => {
    if (value === undefined) setInnerValue(next)
    onValueChange?.(next)
  }

  const moveTo = (next: string) => {
    select(next)
    tabRefs.current.get(next)?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = enabled.findIndex((item) => item.value === current)
    const last = enabled.length - 1
    const targets: Record<string, number> = {
      ArrowRight: index >= last ? 0 : index + 1,
      ArrowLeft: index <= 0 ? last : index - 1,
      Home: 0,
      End: last,
    }
    const target = targets[event.key]
    if (target === undefined || !enabled[target]) return
    event.preventDefault()
    moveTo(enabled[target].value)
  }

  const tabId = (itemValue: string) => `${baseId}-tab-${itemValue}`
  const panelId = (itemValue: string) => `${baseId}-panel-${itemValue}`

  return {
    rootProps: { ...rest, className: cn('flex min-w-0 flex-col gap-3', className) },
    listProps: {
      role: 'tablist' as const,
      'aria-label': ariaLabel,
      'aria-orientation': 'horizontal' as const,
      className: 'flex max-w-full items-center gap-2 overflow-x-auto',
    },
    tabs: items.map((item) => {
      const selected = item.value === current

      return {
        key: item.value,
        label: item.label,
        props: {
          ref: (node: HTMLButtonElement | null) => {
            if (node) tabRefs.current.set(item.value, node)
            else tabRefs.current.delete(item.value)
          },
          type: 'button' as const,
          role: 'tab' as const,
          id: tabId(item.value),
          'aria-selected': selected,
          'aria-controls': panelId(item.value),
          tabIndex: selected ? 0 : -1,
          disabled: item.disabled,
          onClick: () => select(item.value),
          onKeyDown,
          className: cn(
            'inline-flex h-7 flex-1 shrink-0 cursor-pointer touch-manipulation items-center justify-center gap-1.5 rounded-control border px-2.5 text-xs leading-none font-medium whitespace-nowrap transition-[color,background-color,border-color] duration-150 ease-out-expo motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5',
            selected ? 'border-transparent bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground',
          ),
        },
      }
    }),
    panels: items.map((item) => ({
      key: item.value,
      content: item.content,
      props: {
        role: 'tabpanel' as const,
        id: panelId(item.value),
        'aria-labelledby': tabId(item.value),
        hidden: item.value !== current,
        tabIndex: 0,
        className: 'min-w-0 rounded-control text-[13px] break-words text-foreground',
      },
    })),
  }
}
