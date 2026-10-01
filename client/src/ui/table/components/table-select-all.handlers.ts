import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type TableSelectAllProps = Omit<ComponentProps<'input'>, 'type' | 'ref'> & {
  indeterminate?: boolean
  label?: string
}

export default function useTableSelectAll({ className, indeterminate = false, label = 'Seleccionar todos', ...rest }: TableSelectAllProps) {
  return {
    wrapperProps: { className: cn('relative inline-grid size-4 shrink-0 place-items-center align-middle', className) },
    inputProps: {
      ...rest,
      type: 'checkbox' as const,
      'aria-label': label,
      ref: (element: HTMLInputElement | null) => {
        if (element) element.indeterminate = indeterminate
      },
      className: 'peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed',
    },
    boxProps: {
      'aria-hidden': true,
      className: cn(
        'pointer-events-none grid size-4 place-items-center rounded-sm border border-border bg-card text-primary-foreground shadow-control transition-colors duration-150 motion-reduce:transition-none dark:shadow-none',
        'peer-checked:border-primary peer-checked:bg-primary peer-indeterminate:border-primary peer-indeterminate:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-disabled:opacity-50',
        'peer-checked:[&_.check]:block peer-indeterminate:[&_.minus]:block peer-indeterminate:[&_.check]:hidden [&_svg]:hidden [&_svg]:size-3',
      ),
    },
  }
}
