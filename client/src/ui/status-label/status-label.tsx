import { CircleCheck, CircleDashed, CircleX, Stethoscope } from 'lucide-react'
import useStatusLabel, { type StatusLabelProps } from './status-label.handlers'

const icons = {
  confirmada: CircleCheck,
  pendiente: CircleDashed,
  cancelada: CircleX,
  atendida: Stethoscope,
}

export default function StatusLabel(props: StatusLabelProps) {
  const { status, label, rootProps, iconClassName } = useStatusLabel(props)
  const Icon = icons[status]

  return (
    <span {...rootProps}>
      <Icon aria-hidden="true" className={iconClassName} />
      {label}
    </span>
  )
}
