import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type DialogProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger: ReactNode
  title: ReactNode
  description?: ReactNode
  children?: ReactNode | ((close: () => void) => ReactNode)
  className?: string
  triggerClassName?: string
}

export default function useDialog({
  open,
  defaultOpen = false,
  onOpenChange,
  description,
  children,
  className,
  triggerClassName,
}: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpen = open ?? internalOpen
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  const setOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  const close = () => setOpen(false)

  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close()
  }

  return {
    titleId,
    descriptionId,
    content: typeof children === 'function' ? children(close) : children,
    triggerProps: {
      type: 'button' as const,
      'aria-haspopup': 'dialog' as const,
      'aria-expanded': isOpen,
      onClick: () => setOpen(true),
      className: cn('touch-manipulation', triggerClassName),
    },
    dialogProps: {
      ref: dialogRef,
      'aria-labelledby': titleId,
      'aria-describedby': description ? descriptionId : undefined,
      onClose: () => {
        if (isOpen) close()
      },
      onClick: onDialogClick,
      className: cn(
        'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto overscroll-contain rounded-card border border-border bg-neutral-frame p-1 text-popover-foreground shadow-popup backdrop:bg-foreground/40 dark:shadow-none',
        className,
      ),
    },
    closeProps: {
      type: 'button' as const,
      'aria-label': 'Cerrar',
      onClick: close,
      className:
        'absolute top-2.5 right-2.5 inline-flex size-7 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-control text-muted-foreground transition-colors duration-150 ease-out-expo hover:bg-muted hover:text-foreground motion-reduce:transition-none [&_svg]:size-4',
    },
  }
}
