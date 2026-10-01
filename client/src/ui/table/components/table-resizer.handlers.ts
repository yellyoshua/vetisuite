import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { cn } from '@/lib/utils'

export type TableResizerProps = {
  value: number
  min: number
  max: number
  onResize: (px: number) => void
  label: string
  className?: string
}

export default function useTableResizer({ value, min, max, onResize, label, className }: TableResizerProps) {
  const drag = useRef<{ x: number; width: number } | null>(null)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 48 : 16
    const next = { ArrowLeft: value - step, ArrowRight: value + step, Home: min, End: max }[event.key]
    if (next === undefined) return
    event.preventDefault()
    onResize(next)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    drag.current = { x: event.clientX, width: value }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current) onResize(drag.current.width + event.clientX - drag.current.x)
  }

  const onPointerUp = () => {
    drag.current = null
  }

  return {
    resizerProps: {
      role: 'separator',
      'aria-orientation': 'vertical' as const,
      'aria-label': label,
      'aria-valuenow': value,
      'aria-valuemin': min,
      'aria-valuemax': max,
      tabIndex: 0,
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      className: cn(
        'absolute inset-y-0 -right-1 z-10 w-2 cursor-col-resize touch-none select-none after:absolute after:inset-y-2 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-transparent after:transition-colors motion-reduce:after:transition-none hover:after:bg-primary',
        className,
      ),
    },
  }
}
