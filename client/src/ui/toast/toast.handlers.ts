import { useEffect, useEffectEvent, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'default' | 'success' | 'destructive'

export type ToastProps = {
  title: ReactNode
  description?: ReactNode
  variant?: ToastVariant
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  duration?: number
  className?: string
}

const variantClasses: Record<ToastVariant, string> = {
  default: 'border-border',
  success: 'border-primary/30 [&_[data-toast-icon]]:text-primary',
  destructive: 'border-danger/30 [&_[data-toast-icon]]:text-danger',
}

export default function useToast({
  variant = 'default',
  open,
  defaultOpen = false,
  onOpenChange,
  duration,
  className,
}: ToastProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpen = open ?? internalOpen

  const setOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const dismiss = useEffectEvent(() => setOpen(false))

  useEffect(() => {
    if (!isOpen || !duration) return
    const timer = setTimeout(dismiss, duration)
    return () => clearTimeout(timer)
  }, [isOpen, duration])

  const isAlert = variant === 'destructive'

  return {
    isOpen,
    variant,
    regionProps: {
      role: isAlert ? ('alert' as const) : ('status' as const),
      'aria-live': isAlert ? ('assertive' as const) : ('polite' as const),
      'aria-atomic': true,
    },
    toastProps: {
      className: cn(
        'flex w-full max-w-sm items-start gap-2.5 rounded-row border bg-popover p-3 text-[13px] text-popover-foreground shadow-popup dark:shadow-none',
        variantClasses[variant],
        className,
      ),
    },
    closeProps: {
      type: 'button' as const,
      'aria-label': 'Cerrar aviso',
      onClick: () => setOpen(false),
      className:
        '-my-1 -mr-1 inline-flex size-7 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-control text-muted-foreground transition-colors duration-150 ease-out-expo hover:bg-muted hover:text-foreground motion-reduce:transition-none [&_svg]:size-4',
    },
  }
}
