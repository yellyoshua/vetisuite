import { useId, useRef, useState, type ComponentProps, type MouseEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type SidebarItem = {
  label: string
  href: string
  icon?: ReactNode
  active?: boolean
  disabled?: boolean
  badge?: ReactNode
  children?: SidebarItem[]
}

export type SidebarSection = {
  label?: string
  items: SidebarItem[]
}

export type SidebarProps = Omit<ComponentProps<'aside'>, 'children'> & {
  sections: SidebarSection[]
  footer?: ReactNode
  header?: ReactNode
  search?: ReactNode
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  'aria-label'?: string
}

export const sidebarItemClassName =
  'flex h-8 min-w-0 items-center gap-2.5 rounded-control px-2.5 text-[13px] leading-none whitespace-nowrap transition-[color,background-color,box-shadow] duration-150 ease-out-expo motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0'

export function sidebarItemStateClassName(active: boolean | undefined, disabled: boolean | undefined) {
  return cn(
    active ? 'bg-card text-foreground shadow-lift dark:shadow-none' : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
    disabled && 'pointer-events-none opacity-50',
  )
}

const iconButtonClassName =
  'inline-flex size-8 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-control text-muted-foreground transition-colors duration-150 ease-out-expo hover:bg-card hover:text-foreground motion-reduce:transition-none [&_svg]:size-4'

export default function useSidebar({
  sections,
  footer,
  header,
  search,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  className,
  'aria-label': ariaLabel = 'Navegación principal',
  ...rest
}: SidebarProps) {
  const navId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [innerCollapsed, setInnerCollapsed] = useState(defaultCollapsed)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isCollapsed = collapsed ?? innerCollapsed

  const setCollapsed = (next: boolean) => {
    if (collapsed === undefined) setInnerCollapsed(next)
    onCollapsedChange?.(next)
  }

  const openDrawer = () => {
    dialogRef.current?.showModal()
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    dialogRef.current?.close()
    setDrawerOpen(false)
  }

  const buildSections = (compact: boolean, idPrefix: string) =>
    sections.map((section, sectionIndex) => ({
      key: `${sectionIndex}-${section.label ?? ''}`,
      label: compact ? undefined : section.label,
      items: section.items.map((item, itemIndex) => ({
        key: item.href,
        item,
        compact,
        groupId: `${idPrefix}-${sectionIndex}-${itemIndex}`,
        labelClassName: compact ? 'sr-only' : 'min-w-0 flex-1 truncate',
        props: {
          href: item.disabled ? undefined : item.href,
          'aria-current': item.active ? ('page' as const) : undefined,
          'aria-disabled': item.disabled || undefined,
          title: compact ? item.label : undefined,
          className: cn(sidebarItemClassName, compact && 'justify-center px-0', sidebarItemStateClassName(item.active, item.disabled)),
        },
      })),
    }))

  const navClassName = 'flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-2'

  return {
    header,
    search: isCollapsed ? undefined : search,
    footer: isCollapsed ? undefined : footer,
    drawerSearch: search,
    drawerFooter: footer,
    desktopSections: buildSections(isCollapsed, `${navId}-d`),
    drawerSections: buildSections(false, `${navId}-m`),
    expand: () => setCollapsed(false),
    sectionLabelClassName: 'flex items-center px-2.5 pb-1.5 text-xs leading-[1.6] text-muted-foreground uppercase',
    itemBadgeClassName:
      'shrink-0 rounded-sm border border-border bg-card px-1.5 py-[3px] text-[10px] leading-none font-normal text-muted-foreground',
    headerClassName: cn('flex min-h-12 min-w-0 items-center gap-2 px-2 pt-2', isCollapsed && 'flex-col'),
    slotClassName: 'px-2 pt-2',
    footerClassName: 'p-2',
    rootProps: {
      ...rest,
      className: cn(
        'hidden shrink-0 flex-col border-r border-border bg-neutral-frame text-foreground transition-[width] duration-150 ease-out-expo motion-reduce:transition-none md:flex',
        isCollapsed ? 'w-14' : 'w-60',
        className,
      ),
    },
    navProps: { id: navId, 'aria-label': ariaLabel, className: navClassName },
    collapseProps: {
      type: 'button' as const,
      'aria-expanded': !isCollapsed,
      'aria-controls': navId,
      'aria-label': isCollapsed ? 'Expandir menú' : 'Contraer menú',
      title: isCollapsed ? 'Expandir menú' : 'Contraer menú',
      onClick: () => setCollapsed(!isCollapsed),
      className: cn(iconButtonClassName, !isCollapsed && 'ml-auto'),
    },
    isCollapsed,
    triggerProps: {
      type: 'button' as const,
      'aria-haspopup': 'dialog' as const,
      'aria-expanded': drawerOpen,
      'aria-label': 'Abrir menú',
      onClick: openDrawer,
      className: cn(iconButtonClassName, 'md:hidden'),
    },
    dialogProps: {
      ref: dialogRef,
      'aria-label': ariaLabel,
      onClose: () => setDrawerOpen(false),
      onClick: (event: MouseEvent<HTMLDialogElement>) => {
        if (event.target === event.currentTarget) closeDrawer()
      },
      className:
        'm-0 h-dvh max-h-dvh w-64 max-w-[85vw] flex-col border-r border-border bg-neutral-frame p-0 text-foreground shadow-popup open:flex backdrop:bg-foreground/30 md:hidden dark:shadow-none',
    },
    drawerNavProps: {
      'aria-label': ariaLabel,
      className: navClassName,
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (event.target instanceof Element && event.target.closest('a[href]')) closeDrawer()
      },
    },
    drawerCloseProps: {
      type: 'button' as const,
      'aria-label': 'Cerrar menú',
      onClick: closeDrawer,
      className: cn(iconButtonClassName, 'ml-auto'),
    },
  }
}
