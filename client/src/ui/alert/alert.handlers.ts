import { useState, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type AlertVariant = 'info' | 'success' | 'warning' | 'destructive'

export type AlertProps = Omit<ComponentProps<'div'>, 'title'> & {
  variant?: AlertVariant
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const variantClasses: Record<AlertVariant, string> = {
  info: '[&_[data-alert-icon]]:text-info',
  success: '[&_[data-alert-icon]]:text-primary',
  warning: '[&_[data-alert-icon]]:text-warning',
  destructive: '[&_[data-alert-icon]]:text-danger',
}

export default function useAlert({
  variant = 'info',
  title,
  description,
  icon,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
  ...rest
}: AlertProps) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const isOpen = open ?? innerOpen

  const close = () => {
    if (open === undefined) setInnerOpen(false)
    onOpenChange?.(false)
  }

  return {
    isOpen,
    title,
    description,
    icon,
    rootProps: {
      ...rest,
      role: variant === 'destructive' || variant === 'warning' ? ('alert' as const) : ('status' as const),
      className: cn(
        'flex min-w-0 items-start gap-3 rounded-row border border-border bg-card p-3 text-foreground [&_[data-alert-icon]_svg]:size-4',
        variantClasses[variant],
        className,
      ),
    },
    iconClassName: 'inline-flex size-8 shrink-0 items-center justify-center rounded-control border border-border bg-card',
    bodyClassName: 'flex min-w-0 flex-1 flex-col gap-1 self-center',
    titleClassName: 'text-[13px] font-medium break-words',
    descriptionClassName: 'text-xs break-words text-neutral-faint',
    closeProps: {
      type: 'button' as const,
      'aria-label': 'Cerrar alerta',
      onClick: close,
      className:
        'inline-flex size-7 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-control text-muted-foreground transition-colors duration-150 ease-out-expo hover:bg-muted hover:text-foreground motion-reduce:transition-none [&_svg]:size-4',
    },
  }
}
