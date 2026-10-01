import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type DropdownMenuItem = {
  label: ReactNode
  onSelect?: () => void
  disabled?: boolean
  destructive?: boolean
}

export type DropdownMenuProps = {
  trigger: ReactNode
  items: DropdownMenuItem[]
  align?: 'start' | 'end'
  className?: string
  triggerClassName?: string
  'aria-label'?: string
}

export default function useDropdownMenu({ items, align = 'start', className, triggerClassName, ...rest }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()
  const triggerId = useId()

  const enabled = items.map((item, index) => (item.disabled ? -1 : index)).filter((index) => index >= 0)
  const first = enabled[0] ?? 0
  const last = enabled[enabled.length - 1] ?? 0

  useEffect(() => {
    if (open) itemRefs.current[activeIndex]?.focus()
  }, [open, activeIndex])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const openAt = (index: number) => {
    setActiveIndex(index)
    setOpen(true)
  }

  const closeAndFocus = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const move = (step: 1 | -1) => {
    const position = enabled.indexOf(activeIndex)
    setActiveIndex(enabled[(position + step + enabled.length) % enabled.length] ?? first)
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      openAt(first)
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      openAt(last)
    }
  }

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const actions: Record<string, () => void> = {
      ArrowDown: () => move(1),
      ArrowUp: () => move(-1),
      Home: () => setActiveIndex(first),
      End: () => setActiveIndex(last),
      Escape: closeAndFocus,
      Tab: () => setOpen(false),
    }
    const action = actions[event.key]
    if (!action) return
    if (event.key !== 'Tab') event.preventDefault()
    action()
  }

  const select = (item: DropdownMenuItem) => {
    if (item.disabled) return
    closeAndFocus()
    item.onSelect?.()
  }

  return {
    open,
    rootProps: { ref: rootRef, className: 'relative inline-block' },
    triggerProps: {
      ref: triggerRef,
      id: triggerId,
      type: 'button' as const,
      'aria-haspopup': 'menu' as const,
      'aria-expanded': open,
      'aria-controls': menuId,
      'aria-label': rest['aria-label'],
      onClick: () => (open ? setOpen(false) : openAt(first)),
      onKeyDown: onTriggerKeyDown,
      className: cn('touch-manipulation', triggerClassName),
    },
    menuProps: {
      id: menuId,
      role: 'menu' as const,
      'aria-labelledby': triggerId,
      hidden: !open,
      onKeyDown: onMenuKeyDown,
      className: cn(
        'absolute top-full z-50 mt-1 flex max-w-[calc(100vw-2rem)] min-w-40 flex-col gap-px rounded-row border border-border bg-popover p-1 text-popover-foreground shadow-popup dark:shadow-none',
        align === 'end' ? 'right-0' : 'left-0',
        className,
      ),
    },
    items: items.map((item, index) => ({
      key: index,
      label: item.label,
      props: {
        ref: (node: HTMLButtonElement | null) => {
          itemRefs.current[index] = node
        },
        type: 'button' as const,
        role: 'menuitem' as const,
        tabIndex: index === activeIndex ? 0 : -1,
        'aria-disabled': item.disabled || undefined,
        onClick: () => select(item),
        onMouseEnter: () => !item.disabled && setActiveIndex(index),
        className: cn(
          'flex h-8 w-full shrink-0 cursor-pointer touch-manipulation items-center gap-2 rounded-control px-2.5 text-left text-[13px] leading-none whitespace-nowrap text-muted-foreground transition-colors duration-150 ease-out-expo hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground motion-reduce:transition-none aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
          item.destructive && 'text-danger hover:text-danger focus-visible:text-danger [&_svg]:text-danger',
        ),
      },
    })),
  }
}
