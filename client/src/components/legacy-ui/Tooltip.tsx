import { useId, useRef, type FocusEvent, type ReactNode } from 'react'

type TooltipPlacement = 'bottom' | 'right'

type TooltipProps = {
  content: string
  placement?: TooltipPlacement
  children: (describedById: string) => ReactNode
}

const VIEWPORT_MARGIN = 8

function placeTooltip(tooltip: HTMLElement, triggerRect: DOMRect, placement: TooltipPlacement) {
  if (placement === 'right') {
    tooltip.style.left = `${triggerRect.right}px`
    tooltip.style.top = `${triggerRect.top + triggerRect.height / 2 - tooltip.offsetHeight / 2}px`

    return
  }
  const centeredLeft = triggerRect.left + triggerRect.width / 2 - tooltip.offsetWidth / 2
  const maxLeft = window.innerWidth - tooltip.offsetWidth - VIEWPORT_MARGIN
  tooltip.style.left = `${Math.max(VIEWPORT_MARGIN, Math.min(centeredLeft, maxLeft))}px`
  tooltip.style.top = `${triggerRect.bottom}px`
}

export default function Tooltip({ content, placement = 'bottom', children }: TooltipProps) {
  const tooltipId = useId()
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)

  function showTooltipOnKeyboardFocus(event: FocusEvent<HTMLSpanElement>) {
    if (event.target.matches(':focus-visible')) {
      showTooltip()
    }
  }

  function showTooltip() {
    const trigger = wrapperRef.current?.firstElementChild
    const tooltip = tooltipRef.current
    if (!trigger || !tooltip || tooltip.matches(':popover-open')) {
      return
    }
    tooltip.showPopover()
    placeTooltip(tooltip, trigger.getBoundingClientRect(), placement)
  }

  function hideTooltip() {
    const tooltip = tooltipRef.current
    if (!tooltip || !tooltip.matches(':popover-open')) {
      return
    }
    tooltip.hidePopover()
  }

  return (
    <span
      ref={wrapperRef}
      className="contents"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltipOnKeyboardFocus}
      onBlur={hideTooltip}
    >
      {children(tooltipId)}
      <span
        ref={tooltipRef}
        id={tooltipId}
        role="tooltip"
        popover="auto"
        className={`fixed inset-auto m-0 overflow-visible border-0 bg-transparent p-1.5 ${placement === 'right' ? 'pl-2' : 'pt-2'}`}
      >
        <span className="block max-w-60 rounded-control bg-dark px-2.5 py-1.5 font-body text-xs font-medium text-white shadow-tooltip">
          {content}
        </span>
      </span>
    </span>
  )
}
