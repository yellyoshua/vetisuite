import PriorityIndicator from './priority-indicator'

export default function PriorityIndicatorDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <PriorityIndicator level="alta" />
      <PriorityIndicator level="media" />
      <PriorityIndicator level="baja" />
      <PriorityIndicator level="alta" label="Urgencia" />
    </div>
  )
}
