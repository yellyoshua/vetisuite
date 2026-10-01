import { useState } from 'react'
import { cn } from '@/lib/utils'
import { sidebarItemClassName, sidebarItemStateClassName, type SidebarItem } from '../sidebar.handlers'

export type SidebarGroupProps = {
  item: SidebarItem
  groupId: string
  compact: boolean
  onExpand: () => void
}

export default function useSidebarGroup({ item, groupId, compact, onExpand }: SidebarGroupProps) {
  const subItems = item.children ?? []
  const hasActiveChild = subItems.some((child) => child.active)
  const [open, setOpen] = useState(hasActiveChild)

  const toggle = () => {
    if (compact) {
      onExpand()
      setOpen(true)
      return
    }
    setOpen(!open)
  }

  return {
    item,
    compact,
    open: open && !compact,
    labelClassName: compact ? 'sr-only' : 'min-w-0 flex-1 truncate text-left',
    chevronClassName: cn(
      'ml-auto size-3.5 shrink-0 transition-transform duration-150 ease-out-expo motion-reduce:transition-none',
      open && 'rotate-90',
    ),
    buttonProps: {
      type: 'button' as const,
      'aria-expanded': open && !compact,
      'aria-controls': compact ? undefined : groupId,
      title: compact ? item.label : undefined,
      disabled: item.disabled,
      onClick: toggle,
      className: cn(
        sidebarItemClassName,
        'w-full cursor-pointer touch-manipulation',
        compact && 'justify-center px-0',
        sidebarItemStateClassName(hasActiveChild && compact, item.disabled),
      ),
    },
    listProps: { id: groupId, className: 'mt-0.5 ml-[18px] flex flex-col gap-0.5 border-l border-border' },
    subItems: subItems.map((child) => ({
      key: child.href,
      label: child.label,
      badge: child.badge,
      props: {
        href: child.disabled ? undefined : child.href,
        'aria-current': child.active ? ('page' as const) : undefined,
        'aria-disabled': child.disabled || undefined,
        className: cn(
          sidebarItemClassName,
          'relative ml-2.5 h-7 before:pointer-events-none before:absolute before:top-0 before:-left-[11px] before:h-1/2 before:w-2 before:rounded-bl-sm before:border-b before:border-l before:border-border',
          sidebarItemStateClassName(child.active, child.disabled),
        ),
      },
    })),
  }
}
