import usePriorityIndicator, { type PriorityIndicatorProps } from './priority-indicator.handlers'

export default function PriorityIndicator(props: PriorityIndicatorProps) {
  const { label, rootProps, barsClassName, bars } = usePriorityIndicator(props)

  return (
    <span {...rootProps}>
      <span aria-hidden="true" className={barsClassName}>
        {bars.map((bar) => (
          <span key={bar.key} className={bar.className} />
        ))}
      </span>
      <span className="sr-only">Prioridad </span>
      {label}
    </span>
  )
}
