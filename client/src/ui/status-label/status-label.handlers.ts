import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type StatusLabelStatus = 'confirmada' | 'pendiente' | 'cancelada' | 'atendida'

export type StatusLabelProps = Omit<ComponentProps<'span'>, 'children'> & {
  status: StatusLabelStatus
  label?: string
}

const statusClasses: Record<StatusLabelStatus, string> = {
  confirmada: 'text-primary',
  pendiente: 'text-warning',
  cancelada: 'text-danger',
  atendida: 'text-info',
}

export default function useStatusLabel({ status, label, className, ...rest }: StatusLabelProps) {
  return {
    status,
    label: label ?? status,
    rootProps: {
      ...rest,
      className: cn('inline-flex shrink-0 items-center gap-1.5 text-[13px] leading-none font-medium whitespace-nowrap text-foreground', className),
    },
    iconClassName: cn('size-4 shrink-0', statusClasses[status]),
  }
}
