import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BreadcrumbItem = {
  label: string
  href?: string
  icon?: ReactNode
}

export type BreadcrumbProps = Omit<ComponentProps<'nav'>, 'children'> & {
  items: BreadcrumbItem[]
}

export default function useBreadcrumb({ items, className, 'aria-label': ariaLabel = 'Ruta de navegación', ...rest }: BreadcrumbProps) {
  const lastIndex = items.length - 1

  return {
    navProps: { ...rest, 'aria-label': ariaLabel, className: cn('min-w-0 text-[13px]', className) },
    listClassName: 'flex flex-wrap items-center gap-1.5 leading-none text-muted-foreground',
    itemClassName: 'inline-flex min-w-0 items-center gap-1.5',
    separatorClassName: 'shrink-0 text-neutral-faint',
    items: items.map((item, index) => {
      const isCurrent = index === lastIndex

      return {
        key: `${index}-${item.label}`,
        label: item.label,
        icon: item.icon,
        href: isCurrent ? undefined : item.href,
        showSeparator: index > 0,
        ariaCurrent: isCurrent ? ('page' as const) : undefined,
        className: cn(
          'inline-flex min-w-0 items-center gap-1.5 rounded-sm [&_svg]:size-4 [&_svg]:shrink-0',
          isCurrent
            ? 'font-medium text-foreground'
            : 'transition-colors duration-150 ease-out-expo hover:text-foreground motion-reduce:transition-none',
        ),
      }
    }),
  }
}
